import * as cheerio from 'cheerio';

export const parseFideProfile = (html, fideId) => {
  const $ = cheerio.load(html);

  // Extract profile information using the specified selectors
  const name = $('.player-title').text().trim() || "N/A";

  const standardText = $('.profile-standart p').text().trim();
  const rapidText = $('.profile-rapid p').text().trim();
  const blitzText = $('.profile-blitz p').text().trim();

  // Convert ratings to integers, or fallback to "Not rated" if parsing fails
  const standard = standardText && !isNaN(parseInt(standardText, 10)) 
    ? parseInt(standardText, 10) 
    : "Not rated";
  
  const rapid = rapidText && !isNaN(parseInt(rapidText, 10)) 
    ? parseInt(rapidText, 10) 
    : "Not rated";
  
  const blitz = blitzText && !isNaN(parseInt(blitzText, 10)) 
    ? parseInt(blitzText, 10) 
    : "Not rated";

  // Build the object in the desired format
  return {
    [fideId]: {
      name,
      standard,
      rapid,
      blitz,
      fetchDate: new Date().toISOString()
    }
  };
};
