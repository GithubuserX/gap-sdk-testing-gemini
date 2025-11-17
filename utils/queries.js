/**
 * Test Queries Module - English and Swahili query arrays
 * Max 200 lines per file rule
 */

// Comprehensive 100 queries (English)
export const COMPREHENSIVE_QUERIES = [
  // === GENERAL WEATHER QUERIES (10) ===
  'What is the weather forecast for the next 5 days?',
  'Will it rain tomorrow?',
  'What is the temperature forecast for the next 5 days?',
  'What is the humidity forecast?',
  'Will there be strong winds in the next 5 days?',
  'What is the weather forecast for Nairobi?',
  'What are the weather conditions for farming over the next 5 days?',
  'What is the weather pattern for the season?',
  'Is there a risk of drought?',
  'What is the forecast for irrigation planning?',
  
  // === PLANTING DECISIONS - CEREALS (10) ===
  'Should I plant maize this week?',
  'Is it a good time to plant wheat?',
  'Can I plant rice now?',
  'Should I plant sorghum this week?',
  'Is it suitable to plant millet now?',
  'When should I plant maize?',
  'Should I delay planting wheat due to weather?',
  'Is the weather good for planting rice?',
  'Can I start planting sorghum?',
  'Should I prepare my fields for planting maize?',
  
  // === PLANTING DECISIONS - LEGUMES (10) ===
  'Is it a good time to plant beans?',
  'Should I plant cowpea this week?',
  'Can I plant pigeon pea now?',
  'Is it suitable to plant groundnut?',
  'When should I plant beans?',
  'Should I delay planting cowpea due to weather?',
  'Is the weather good for planting pigeon pea?',
  'Can I start planting groundnut?',
  'Should I prepare my fields for planting beans?',
  'Is it the right time to plant legumes?',
  
  // === PLANTING DECISIONS - ROOT CROPS (5) ===
  'Should I plant cassava this week?',
  'Is it a good time to plant sweet potato?',
  'Can I plant potato now?',
  'When should I plant cassava?',
  'Is the weather suitable for planting root crops?',
  
  // === PLANTING DECISIONS - VEGETABLES (10) ===
  'Should I plant tomato this week?',
  'Is it a good time to plant cabbage?',
  'Can I plant kale now?',
  'Should I plant onion this week?',
  'Is it suitable to plant vegetables?',
  'When should I plant tomato?',
  'Should I delay planting cabbage due to weather?',
  'Is the weather good for planting kale?',
  'Can I start planting onion?',
  'Should I prepare my fields for planting vegetables?',
  
  // === PLANTING DECISIONS - CASH CROPS (10) ===
  'Should I plant tea this week?',
  'Is it a good time to plant coffee?',
  'Can I plant sugarcane now?',
  'Should I plant banana this week?',
  'Is it suitable to plant sunflower?',
  'Can I plant cotton now?',
  'When should I plant coffee?',
  'Should I delay planting tea due to weather?',
  'Is the weather good for planting sugarcane?',
  'Should I prepare my fields for planting cash crops?',
  
  // === IRRIGATION QUERIES (10) ===
  'Do I need to irrigate my crops?',
  'Should I irrigate my maize field?',
  'Do my beans need irrigation this week?',
  'How often should I irrigate my tomato plants?',
  'Should I water my coffee plants?',
  'Do I need to irrigate due to lack of rain?',
  'What is the irrigation schedule for this week?',
  'Should I increase irrigation for my crops?',
  'Do my vegetables need more water?',
  'Is irrigation necessary given the weather forecast?',
  
  // === HARVESTING & FIELD OPERATIONS (10) ===
  'Is the weather suitable for harvesting?',
  'Can I harvest my maize this week?',
  'Is it safe to harvest beans with this weather?',
  'Should I delay harvesting due to rain?',
  'Is the weather good for field work?',
  'Can I apply fertilizer this week?',
  'Should I prepare my fields for planting?',
  'Is it a good time for land preparation?',
  'Can I do weeding this week?',
  'Should I delay field operations due to weather?',
  
  // === CROP-SPECIFIC ADVISORIES (10) ===
  'How will the weather affect my maize crop?',
  'What farming advice do you have for beans?',
  'How is the weather for my tomato plants?',
  'What should I know about the weather for coffee?',
  'How will this weather impact my rice field?',
  'What are the weather risks for my cabbage?',
  'How is the weather affecting my tea plantation?',
  'What weather conditions should I watch for wheat?',
  'How will the forecast affect my sorghum?',
  'What are the optimal weather conditions for my crops?',
  
  // === RISK ASSESSMENT & PLANNING (10) ===
  'Is there a risk of drought in the coming weeks?',
  'Will there be excessive rainfall?',
  'Are there any weather warnings I should know about?',
  'What are the weather risks for farming this month?',
  'Should I be concerned about extreme weather?',
  'What is the long-term weather outlook?',
  'How should I plan my farming activities based on weather?',
  'What weather patterns should I prepare for?',
  'Are conditions favorable for crop growth?',
  'What are the optimal planting conditions?',
  
  // === SPECIFIC WEATHER CONDITIONS (10) ===
  'How much rainfall is expected in the next 5 days?',
  'What will be the temperature range for the next 5 days?',
  'Will there be frost risk?',
  'What is the wind speed forecast?',
  'How humid will it be in the next 5 days?',
  'Will there be any storms?',
  'What is the precipitation forecast?',
  'How will the temperature affect my crops?',
  'Is there enough rainfall for my crops?',
  'What are the daily weather conditions?'
];

// Swahili translations of queries (same structure as English)
export const SWAHILI_QUERIES = [
  // === GENERAL WEATHER QUERIES (10) ===
  'Hali ya hewa itakuwa vipi kwa siku 5 zijazo?',
  'Kutakuwa na mvua kesho?',
  'Joto litakuwa vipi kwa siku 5 zijazo?',
  'Unyevu utakuwa vipi?',
  'Kutakuwa na upepo mkuu kwa siku 5 zijazo?',
  'Hali ya hewa ya Nairobi ni vipi?',
  'Hali ya hewa kwa kilimo kwa siku 5 zijazo ni vipi?',
  'Mfumo wa hali ya hewa kwa msimu ni upi?',
  'Kuna hatari ya ukame?',
  'Utabiri wa hali ya hewa kwa mipango ya umwagiliaji ni upi?',
  
  // === PLANTING DECISIONS - CEREALS (10) ===
  'Je, nipande mahindi wiki hii?',
  'Je, ni wakati mwema wa kupanda ngano?',
  'Naweza kupanda mchele sasa?',
  'Je, nipande mtama wiki hii?',
  'Je, ni sawa kupanda ulezi sasa?',
  'Nipande mahindi lini?',
  'Je, nisubiri kupanda ngano kwa sababu ya hali ya hewa?',
  'Je, hali ya hewa ni nzuri kwa kupanda mchele?',
  'Naweza kuanza kupanda mtama?',
  'Je, niandae mashamba yangu kwa kupanda mahindi?',
  
  // === PLANTING DECISIONS - LEGUMES (10) ===
  'Je, ni wakati mwema wa kupanda maharage?',
  'Je, nipande kunde wiki hii?',
  'Naweza kupanda mbaazi sasa?',
  'Je, ni sawa kupanda karanga?',
  'Nipande maharage lini?',
  'Je, nisubiri kupanda kunde kwa sababu ya hali ya hewa?',
  'Je, hali ya hewa ni nzuri kwa kupanda mbaazi?',
  'Naweza kuanza kupanda karanga?',
  'Je, niandae mashamba yangu kwa kupanda maharage?',
  'Je, ni wakati mwema wa kupanda mbegu za jamii ya maharage?',
  
  // === PLANTING DECISIONS - ROOT CROPS (5) ===
  'Je, nipande mihogo wiki hii?',
  'Je, ni wakati mwema wa kupanda viazi vitamu?',
  'Naweza kupanda viazi sasa?',
  'Nipande mihogo lini?',
  'Je, hali ya hewa ni sawa kwa kupanda mazao ya mizizi?',
  
  // === PLANTING DECISIONS - VEGETABLES (10) ===
  'Je, nipande nyanya wiki hii?',
  'Je, ni wakati mwema wa kupanda kabichi?',
  'Naweza kupanda sukuma wiki sasa?',
  'Je, nipande vitunguu wiki hii?',
  'Je, ni sawa kupanda mboga?',
  'Nipande nyanya lini?',
  'Je, nisubiri kupanda kabichi kwa sababu ya hali ya hewa?',
  'Je, hali ya hewa ni nzuri kwa kupanda sukuma wiki?',
  'Naweza kuanza kupanda vitunguu?',
  'Je, niandae mashamba yangu kwa kupanda mboga?',
  
  // === PLANTING DECISIONS - CASH CROPS (10) ===
  'Je, nipande chai wiki hii?',
  'Je, ni wakati mwema wa kupanda kahawa?',
  'Naweza kupanda miwa sasa?',
  'Je, nipande ndizi wiki hii?',
  'Je, ni sawa kupanda alizeti?',
  'Naweza kupanda pamba sasa?',
  'Nipande kahawa lini?',
  'Je, nisubiri kupanda chai kwa sababu ya hali ya hewa?',
  'Je, hali ya hewa ni nzuri kwa kupanda miwa?',
  'Je, niandae mashamba yangu kwa kupanda mazao ya biashara?',
  
  // === IRRIGATION QUERIES (10) ===
  'Je, mazao yangu yanahitaji umwagiliaji?',
  'Je, nimwagilie shamba langu la mahindi?',
  'Je, maharage yangu yanahitaji umwagiliaji wiki hii?',
  'Mara ngapi nimwagilie mimea yangu ya nyanya?',
  'Je, nimwagilie mimea yangu ya kahawa?',
  'Je, nahitaji kumwagilia kwa sababu ya ukosefu wa mvua?',
  'Ratiba ya umwagiliaji kwa wiki hii ni ipi?',
  'Je, niongeze umwagiliaji kwa mazao yangu?',
  'Je, mboga zangu zinahitaji maji zaidi?',
  'Je, umwagiliaji ni muhimu kutokana na utabiri wa hali ya hewa?',
  
  // === HARVESTING & FIELD OPERATIONS (10) ===
  'Je, hali ya hewa ni sawa kwa mavuno?',
  'Naweza kuvuna mahindi yangu wiki hii?',
  'Je, ni salama kuvuna maharage kwa hali hii ya hewa?',
  'Je, nisubiri mavuno kwa sababu ya mvua?',
  'Je, hali ya hewa ni nzuri kwa kazi ya shambani?',
  'Naweza kuweka mbolea wiki hii?',
  'Je, niandae mashamba yangu kwa kupanda?',
  'Je, ni wakati mwema wa kuandaa ardhi?',
  'Naweza kufanya ufagio wiki hii?',
  'Je, nisubiri shughuli za shambani kwa sababu ya hali ya hewa?',
  
  // === CROP-SPECIFIC ADVISORIES (10) ===
  'Je, hali ya hewa itaathiri mazao yangu ya mahindi vipi?',
  'Je, una ushauri gani wa kilimo kwa maharage?',
  'Je, hali ya hewa kwa mimea yangu ya nyanya ni vipi?',
  'Je, nifahamu nini kuhusu hali ya hewa kwa kahawa?',
  'Je, hali hii ya hewa itaathiri shamba langu la mchele vipi?',
  'Je, hatari za hali ya hewa kwa kabichi ni zipi?',
  'Je, hali ya hewa inaathiri shamba langu la chai vipi?',
  'Je, hali gani za hali ya hewa nifuatilie kwa ngano?',
  'Je, utabiri utaathiri mtama wangu vipi?',
  'Je, hali bora za hali ya hewa kwa mazao yangu ni zipi?',
  
  // === RISK ASSESSMENT & PLANNING (10) ===
  'Kuna hatari ya ukame kwa wiki zijazo?',
  'Kutakuwa na mvua nyingi?',
  'Kuna maonyo yoyote ya hali ya hewa nifahamu?',
  'Je, hatari za hali ya hewa kwa kilimo mwezi huu ni zipi?',
  'Je, nihofu hali mbaya ya hewa?',
  'Je, mtazamo wa hali ya hewa kwa muda mrefu ni upi?',
  'Je, nipange shughuli zangu za kilimo kulingana na hali ya hewa vipi?',
  'Je, mifumo gani ya hali ya hewa nipange?',
  'Je, hali ni mazuri kwa ukuaji wa mazao?',
  'Je, hali bora za kupanda ni zipi?',
  
  // === SPECIFIC WEATHER CONDITIONS (10) ===
  'Je, mvua ngapi inatarajiwa kwa siku 5 zijazo?',
  'Je, anuwai ya joto kwa siku 5 zijazo itakuwa ipi?',
  'Kutakuwa na hatari ya baridi kali?',
  'Je, kasi ya upepo itakuwa ipi?',
  'Je, unyevu utakuwa vipi kwa siku 5 zijazo?',
  'Kutakuwa na dhoruba?',
  'Je, utabiri wa mvua ni upi?',
  'Je, joto litaathiri mazao yangu vipi?',
  'Je, kuna mvua ya kutosha kwa mazao yangu?',
  'Je, hali ya hewa ya kila siku ni ipi?'
];

