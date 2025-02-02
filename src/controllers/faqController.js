const FAQ = require('../models/FAQ');
const redis = require('../config/redis');
const translate = require('google-translate-api-x');

exports.getFAQs = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    
    // Check Redis cache first
    const cachedFAQs = await redis.get(`faqs_${lang}`);
    if (cachedFAQs) {
      return res.json(JSON.parse(cachedFAQs));
    }

    // Fetch FAQs with timeout handling
    const faqs = await Promise.race([
      FAQ.find().lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 9000)
      )
    ]);

    if (lang && lang !== 'en') {
      const translatedFaqs = await Promise.all(
        faqs.map(async (faq) => {
          if (faq.translations?.[lang]) {
            return { ...faq, question: faq.translations[lang] };
          }

          try {
            const { text: translatedText } = await translate(faq.question, { to: lang });
            
            // Update translation in database
            await FAQ.findByIdAndUpdate(faq._id, {
              [`translations.${lang}`]: translatedText
            });

            return { ...faq, question: translatedText };
          } catch (err) {
            console.error('❌ Translation Error:', err);
            return faq; // Fallback to original question
          }
        })
      );

      // Cache translated results
      await redis.setex(`faqs_${lang}`, 3600, JSON.stringify(translatedFaqs));
      return res.json(translatedFaqs);
    }

    // Cache and return English results
    await redis.setex(`faqs_${lang}`, 3600, JSON.stringify(faqs));
    return res.json(faqs);
  } catch (error) {
    console.error('❌ FAQ Fetch Error:', error);
    res.status(error.message === 'Database operation timed out' ? 504 : 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({ question, answer, translations: {} });
    await faq.save();

    // Clear all language caches since we have a new FAQ
    const keys = await redis.keys('faqs_*');
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(201).json(faq);
  } catch (error) {
    console.error('❌ FAQ Creation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};