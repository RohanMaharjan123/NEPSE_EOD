// lib/scrapeNepseData.js
const axios = require('axios');
const cheerio = require('cheerio');

export async function scrapeNepseData() {
  try {
    const { data } = await axios.get('http://www.nepalstock.com/main/todays_price/index/');
    const $ = cheerio.load(data);

    // Extract NEPSE Index
    const nepseIndex = $('#nepseIndexValue').text().trim();
    const nepseChange = $('#nepseChange').text().trim();
    const nepseChangePercent = $('#nepseChangePercent').text().trim();

    // Extract Top Gainers and Losers
    const topGainers = [];
    const topLosers = [];

    $('table#topGainers tbody tr').each((i, el) => {
      const symbol = $(el).find('td:eq(0)').text().trim();
      const ltp = $(el).find('td:eq(1)').text().trim();
      const change = $(el).find('td:eq(2)').text().trim();
      const changePercent = $(el).find('td:eq(3)').text().trim();

      topGainers.push({ symbol, ltp, change, changePercent });
    });

    $('table#topLosers tbody tr').each((i, el) => {
      const symbol = $(el).find('td:eq(0)').text().trim();
      const ltp = $(el).find('td:eq(1)').text().trim();
      const change = $(el).find('td:eq(2)').text().trim();
      const changePercent = $(el).find('td:eq(3)').text().trim();

      topLosers.push({ symbol, ltp, change, changePercent });
    });

    return {
      nepseIndex: {
        value: nepseIndex,
        change: nepseChange,
        changePercent: nepseChangePercent,
      },
      topGainers,
      topLosers,
    };
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
}
