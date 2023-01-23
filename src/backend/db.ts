// as the backend, db is a ts file instead of a tsx file.
import {plural, randomInt, randomWithin, Statistic} from './util'
import {auth} from '../private/auth'

import PouchDB from 'pouchdb';
import plugin from 'pouchdb-find';
PouchDB.plugin(plugin);

let db = createDB();
function createDB(dbName: string = "mock-tagged-objects") {
	return new PouchDB("http://localhost:5984/"+dbName, {
		auth: auth.dbAuth
	});
}

// MAIN FUNCTIONS

async function addToDB(name: string, tags: string[]): Promise<string> {
	const doc = {
		_id: new Date().toJSON(),
		name: name,
		tags: tags
	};
	await db.put(doc);
	return `Added document '${name}' with ${plural(tags.length, "tag")}.`;
}


// DEBUGGING FUNCTIONS

export async function fetchDocCount(): Promise<string> {
	const value = await db.info();
	console.log("db info:");
	console.log(value);
	return `DB "${value.db_name}" has ${plural(value.doc_count, "document")}.`;
}

// clear the DB for debugging purposes
export async function clearDb(): Promise<string> {
	await db.destroy();
	// re-create db
	db = createDB();
	await db.info();
	return "DB cleared.";
}

export async function createIndex(): Promise<string> {
	await db.createIndex({
		index: {
			fields: ['tags'],
			name: "tag-array-index"
		}
	});
	
	return "Index created.";
}

// put a ton of stuff into the db to test lookup speeds
export async function populateDb(): Promise<string> {
	const numDocs = randomWithin(5000, 8000);
	// const numDocs = 50;
	const minTagsPer = 1;
	const maxTagsPer = 50;
	
	// track how many documents each tag was associated with
	let docsPerTag = new Array<number>(MOCK_TAG_LIST.length);
	for(let i = 0; i < MOCK_TAG_LIST.length; i++) docsPerTag[i] = 0;
	
	// track how many tags are in each document
	let documentStats = new Statistic();
	
	console.log(`populating db with ${plural(numDocs, "document")}...`);
	for(let docIdx = 1; docIdx <= numDocs; docIdx++) {
		// determine how many tags to give this document
		const numTags = randomWithin(minTagsPer, maxTagsPer);
		documentStats.record(numTags);
		
		// aggregate tags
		let tagsToAttach = [];
		let tagIndexSet = new Set<number>(); // track which have been added
		for(let j = 0; j < numTags; j++) {
			// pick the index
			const tagIndex = randomInt(MOCK_TAG_LIST.length-1);
			if(tagIndexSet.has(tagIndex)) {
				j--;
				continue;
			}
			tagIndexSet.add(tagIndex);
			// add the designated tag
			tagsToAttach.push(MOCK_TAG_LIST[tagIndex]);
			// update tag stats
			docsPerTag[tagIndex]++;
		}
		
		// create document
		const name = randomString(2, STR_ALPHABET) + randomString(randomWithin(5, 40), STR_ALL);
		await addToDB(name, tagsToAttach);
		
		if(docIdx % 100 === 0)
			console.log(`Processed ${plural(docIdx, "document")}...`);
	}
	
	console.log("aggregating data...");
	
	let tagStats = new Statistic();
	for(let docCount of docsPerTag)
		tagStats.record(docCount);
	
	documentStats.printValues("===Tags per Document:");
	tagStats.printValues("===Documents per Tag:");
	
	return `DB populated with ${plural(numDocs, "document")}.`;
}

// UTIL

// for iterating through letters
const STR_ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const STR_ALL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-=_+[]{}|;,./:<>?";

function randomString(length: number, strSet: string) {
	let str = "";
	// generate each character
	for(let j = 0; j < length; j++)
		str += strSet[randomInt(strSet.length-1)];
	return str;
}

// a procedurally generated, random list of "tag" strings.
const MOCK_TAG_LIST: string[] = (() => {
	if(true) return [];
	
	console.log("building mock tag list...");
	
	let tagList: string[] = [];
	
	// choose a random number of each length to generate, up to a max length
	
	const maxTagNameLength = 30; // at most 30 letters
	const maxTagCountPerLength = 100; // at most 100 tags per length
	const maxTagCountLow = [5, 20, 75]; // at lengths 1, 2, and 3
	
	let curLength = 1;
	while(curLength <= maxTagNameLength) {
		// determine max tag count
		const maxTagCount = curLength <= maxTagCountLow.length ? maxTagCountLow[curLength-1] : maxTagCountPerLength;
		// determine how many tags of this length to make
		const tagCount = randomInt(maxTagCount);
		
		// create a set which will hold all the tags made to prevent duplicates
		let tagSet = new Set<string>();
		// generate the tags
		for(let i = 0; i < tagCount; i++) {
			let newTag = randomString(curLength, STR_ALPHABET);
			// check for uniqueness
			if(tagSet.has(newTag)) {
				// try again
				i--;
				continue;
			}
			// append
			tagSet.add(newTag);
			tagList.push(newTag);
		}
		
		// increment
		curLength++;
	}
	
	console.log(`built mock tag list with ${plural(tagList.length, "tag")}.`);
	
	return tagList;
})();
