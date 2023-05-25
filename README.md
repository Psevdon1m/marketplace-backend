# Backend For Marketplace Project
Backend for the nft-marketplace https://github.com/Psevdon1m/nft-marketplace
This backend project consists of the following files and directories:

- `api/api.js`: This file contains the server code that runs the backend API. It listens on port 3000 and handles incoming HTTP requests. You can modify this file to add or modify API endpoints and their corresponding logic.

- `routes/index.js`: This file encapsulates all the route definitions for the API. It is responsible for mapping incoming requests to the appropriate route handlers. You can add or modify routes in this file to match your project requirements.

- `database/database.js`: This file encapsulates the logic related to the database. It handles database connections, queries, and any other operations related to data persistence. You can modify this file to customize the database functionality for your project.

- `scanner/`: This directory contains two indexer files for blockchain events scanning.

  - `event_scanner.js`: This file is a blockchain indexer that fetches contract events from an HTTPS RPC node. It parses the data and saves the event data to the database. You can customize this file to fetch and process events based on your specific contract requirements.

  - `event_socket.js`: This file is a blockchain indexer that establishes a WebSocket (WSS) connection to the node. It receives contract events in real-time when they appear. This method is faster than the HTTPS RPC script. The received event data is parsed and saved to the database. You can modify this file to handle WebSocket events and store them in the database accordingly.

- `conf/`: This directory contains multiple blockchain configuration files. Each file represents a different blockchain network such as Ethereum (ETH), Binance Smart Chain (BSC), and Polygon (MATIC). These configuration files allow you to start scanning multiple blockchains simultaneously. You can add or modify these configuration files to match your desired blockchain networks and their corresponding RPC endpoints.

## Getting Started

To set up and run the backend project, follow these steps:

1. Clone the repository to your local machine.

2. Install the required dependencies by running `npm install` in the project's root directory.

3. Modify the configuration files in the `conf/` directory to match your desired blockchain networks and RPC endpoints.

4. Ensure you have a compatible database system installed and running. Update the database configuration in `database/database.js` to connect to your database.

5. Run the API server by executing `node api/api.js`. The server will start and listen for incoming requests on port 3000.

6. Optionally, run the event scanner or event socket scripts from the `scanner/` directory to start scanning and processing blockchain events based on your project's requirements.

## API Endpoints

The API provides various endpoints for interacting with the backend. You can find the available endpoints and their corresponding functionalities in the `routes/index.js` file. Modify this file to add, update, or remove endpoints as needed for your project.

## Database Operations

The `database/database.js` file contains the logic for connecting to and interacting with the database. You can modify this file to customize the database operations based on your project's specific needs. Make sure to update the database configuration to connect to your chosen database system.

## Blockchain Event Scanning

The `scanner/` directory contains the event scanner scripts for fetching and processing blockchain events. You can use the provided scripts as a starting point and customize them according to your specific contract requirements. Modify the event scanner or event socket files (`event_scanner.js` and `event_socket.js`) to fetch, parse, and store events from the blockchain.

## Configuration Files

The `conf/` directory contains configuration files for different blockchain networks. Update these files with the necessary network details, such as blockchain name, RPC endpoint, and any other required configurations. This allows you to scan

 multiple blockchains simultaneously based on your project requirements.

Feel free to modify, expand, and enhance the project according to your needs. Happy coding!
