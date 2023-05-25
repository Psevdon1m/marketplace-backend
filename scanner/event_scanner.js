const config = require(process.argv[2]);
const { ethers } = require("ethers");
const mysql = require("mysql2");
const log4js = require("log4js");
require("dotenv").config();

const contractAddress = config.CONTRACT_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(config.NODE);
const contract = new ethers.Contract(contractAddress, config.ABI, provider);
const iface = new ethers.utils.Interface(config.ABI);

log4js.configure({
  appenders: {
    logfile: {
      type: "file",
      filename: "event_scanner.log",
    },
    console: {
      type: "console",
    },
  },
  categories: {
    default: {
      appenders: ["logfile", "console"],
      level: "all",
    },
  },
});

const connection = mysql
  .createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  })
  .promise();

const logger = log4js.getLogger();

async function main() {
  const blockFrom = await getLatestBlock();

  let events = await getEvents(blockFrom);

  for (let event of events) {
    await writeEventToDB(event);
  }

  await connection.end();
}
/**
 * Fetches events from contract that is passed in params
 * @param blockFrom  number of block to start scanning from
 */
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
async function getEvents(blockFrom) {
  let allEvents = [];
  let lastBlockReached = false;
  try {
    //setup last block number received from blockchain node

    let lastBlock = await provider.getBlockNumber();
    //create filter for each event
    console.log("latest block on blockchain", lastBlock);
    let filterItemBought = contract.filters.ItemBought();
    let filterNewListing = contract.filters.NewListing();

    for (let block = blockFrom; block < lastBlock; ) {
      //setup start block for filters
      console.log("block", block);
      filterItemBought.fromBlock = block;
      filterNewListing.fromBlock = block;

      //setup finish blocknumber for each filter
      filterItemBought.toBlock = block + config.BLOCK_RANGE;
      filterNewListing.toBlock = block + config.BLOCK_RANGE;

      //check if finish block is more that current last blockchain block number
      if (filterItemBought.toBlock > lastBlock) {
        filterItemBought.toBlock = lastBlock;
        filterNewListing.toBlock = lastBlock;

        lastBlockReached = true;
      }
      //gather get logs function to complete in promise
      let [eventsItemBought, eventsNewListing] = await Promise.all([
        provider.getLogs(filterItemBought),
        provider.getLogs(filterNewListing),
      ]);

      //parse event data so it fits our db schema
      let resultItemBought = eventsItemBought.map((el) =>
        getReadableDataFromEvent(el, "ItemBought")
      );
      let resultNewListing = eventsNewListing.map((el) =>
        getReadableDataFromEvent(el, "NewListing")
      );

      //return array of all scanned & parsed events
      allEvents = [...allEvents, ...resultItemBought, ...resultNewListing];
      console.log(allEvents);
      // update last scanned block in db
      if (lastBlockReached) {
        new Promise(async (res) => {
          try {
            let insertLastBlockQuery = `UPDATE last_scanned_blocks SET last_scanned_block = ?`;
            await connection.query(insertLastBlockQuery, [lastBlock]);
            logger.info(`Last scanned block ${lastBlock}`);
          } catch (e) {
            console.log(e);
            logger.error(e);
          }

          res();
        });
        break;
      }
      //waiting between set of blocks in order to not be banned by rpc node/ not to spam node too much
      await timer(1000);
      block += config.BLOCK_RANGE;
    }
    console.log(allEvents);
    return allEvents;
  } catch (error) {
    console.log(error);
    logger.error(error);
  }
}

function getReadableDataFromEvent(event, eventName) {
  try {
    let data = event.data;
    let topics = event.topics;

    let event_index = event.logIndex;

    let block_number = event.blockNumber;
    let transaction_id = event.transactionHash;

    if (eventName === "ItemBought") {
      const res = iface.decodeEventLog("ItemBought", data, topics);

      const buyer = res[0];
      const nftAddress = res[1];
      const tokenId = Number(res[2]["_hex"]);
      const price = ethers.utils.formatEther(res[3]);

      return {
        event_index,
        event_type: "ItemBought",
        buyer,
        nftAddress,
        tokenId,
        block_number,
        price,
        transaction_id,
      };
    } else if (eventName === "NewListing") {
      const res = iface.decodeEventLog("NewListing", data, topics);

      const seller = res[0];
      const price = ethers.utils.formatEther(res[1]);
      const nftAddress = res[2];
      const tokenId = Number(res[3]["_hex"]);

      return {
        event_index,
        event_type: "NewListing",
        seller,
        price,
        nftAddress,
        tokenId,
        block_number,
        transaction_id,
      };
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
  }
}

async function getLatestBlock() {
  //if db contains different contracts accross different chains you want to select last block  for specific chainid and contract address deployed in this chain.
  try {
    let query = `SELECT last_scanned_block FROM last_scanned_blocks`;
    let lastBlockRaw = await connection.query(query);
    let lastBlock = lastBlockRaw[0][0].last_scanned_block;
    if (lastBlock) {
      //scanner will double check lastly included transactions
      return Number(lastBlock) - 100;
    } else {
      return config.START_BLOCK;
    }
  } catch (error) {
    logger.error(error);
  }
}

async function writeEventToDB(event) {
  //Just a mock script, sql query depends on your db  structure
  if (!event) {
    return;
  }

  return new Promise(async (res) => {
    try {
      const { eventData1, eventData2 } = event;

      const insertEventQuery = `
              INSERT INTO table (
                value1, value2
              ) VALUES (
                ?,
                ?
              )
            `;

      await connection.query(insertEventQuery, [eventData1, eventData2]);

      console.log(`Event inserted: ${eventType}`);
    } catch (error) {
      console.error(`Error inserting event: ${error}`);
    }

    res();
  });
}

main();
