import * as cheerio from 'cheerio';

export const parseFideProfile = (html, fideId) => {
  const $ = cheerio.load(html);

  // Extract profile information
  const name = $('.player-title').text().trim() || "N/A";

  const standardText = $('.profile-standart p').text().trim();
  const rapidText = $('.profile-rapid p').text().trim();
  const blitzText = $('.profile-blitz p').text().trim();

  // Convert ratings to integers, or null if not rated
  const currentStd = standardText && !isNaN(parseInt(standardText, 10)) 
    ? parseInt(standardText, 10) 
    : null;
  
  const currentRpd = rapidText && !isNaN(parseInt(rapidText, 10)) 
    ? parseInt(rapidText, 10) 
    : null;
  
  const currentBlz = blitzText && !isNaN(parseInt(blitzText, 10)) 
    ? parseInt(blitzText, 10) 
    : null;

  // Extract historical data from the table
  const rows = $('.profile-table_calc tbody tr');
  
  // Function to find previous rating with valid data
  const findPreviousRating = (ratingIndex) => {
    // Start from second row (index 1) since first row is current
    for (let i = 1; i < rows.length; i++) {
      const prevRow = $(rows[i]).find('td');
      const prevRating = parseInt($(prevRow[ratingIndex]).text().trim());
      
      if (!isNaN(prevRating) && prevRating > 0) {
        return prevRating;
      }
    }
    return null; // No previous rating found
  };

  const previousStd = rows.length > 1 ? findPreviousRating(1) : null;
  const previousRpd = rows.length > 1 ? findPreviousRating(3) : null;
  const previousBlz = rows.length > 1 ? findPreviousRating(5) : null;

  // Function to determine change
  const getChange = (current, previous) => {
    if (current === null) return null;
    if (previous === null) return null; // First rating
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  // Function to calculate difference
  const getDiff = (current, previous) => {
    if (current === null || previous === null) return 0;
    return current - previous;
  };

  // Build rating objects
  const buildRatingObject = (current, previous) => {
    if (current === null) {
      return "Not rated";
    }
    
    return {
      rating: current,
      change: getChange(current, previous),
      diff: getDiff(current, previous),
      first: previous === null
    };
  };

  return {
    [fideId]: {
      name,
      standard: buildRatingObject(currentStd, previousStd),
      rapid: buildRatingObject(currentRpd, previousRpd),
      blitz: buildRatingObject(currentBlz, previousBlz),
      fetchDate: new Date().toISOString()
    }
  };
};