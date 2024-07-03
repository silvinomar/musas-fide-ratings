# Musas FIDE Ratings UI

A user interface to display FIDE ratings from [Musas](http://musas.pegada.net/) players. It's built on top of FIDE ratings scraper developed by [Rui Alves](https://github.com/silvinomar/fide-ratings-scraper).

This project was bootstrapped with [Create React App](https://create-react-app.dev/).

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-repo.git

2. Navigate to the project directory:
  
   ```bash
    cd your-repo

3. Install dependencies:

    ```bash
    npm install

### Running the app
To start the app in development mode, run:

   ```bash
    npm start
   ```

Open http://localhost:3000 in your browser to view the app.

### Updating FIDE stats
The FIDE IDs used to fetch data are located in **`src/data/musas-fideIds.js`**. The FIDE stats are saved in **`src/data/musas-data.json`**. This file contains the stats for each player and it's the 'database' used to build the UI.

To update the FIDE stats (**`musas-data.json`** and consequently the UI), run the following command:

   ```bash
    node api/src/api.js
   ```
   
### Additional Information
For more details on available scripts and project structure, refer to the Create React App documentation.
