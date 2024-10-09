const MemoryDB = require('../../src/model/data/memory/memory-db');
const { 
    writeFragment, 
    readFragment, 
    writeFragmentData, 
    readFragmentData, 
    listFragments, 
    deleteFragment 
  } = require('../../src/model/data/memory/index');  // Adjust the path based on your folder structure

describe('MemoryDB', () => {
    let db;

    let data;
    let metadata;

    beforeEach(() => {
        data = new MemoryDB();
        metadata = new MemoryDB();
    });

    //!TEST CASE NO: 1
    test('writeFragment and readFragment should write and read fragment metadata', async() => {
        const fragments = {
            id: '123', 
            ownerId: 'user1',
            type: 'text/plain',
            content: 'Test content'
        };

        //Write the fragment
        await writeFragment(fragments);

        //Read the fragment
        const result = await readFragment('user1', '123');

        expect(result).toEqual(fragments);
    });

    //!TEST CASE NO: 2
    test('writeFragmentData and readFragmentData should write and read fragment data', async() => {
        const buffer = Buffer.from('Test content');
        const ownerId = 'user1';
        const fragmentId = '123';

        //Write the data
        await writeFragmentData(ownerId, fragmentId, buffer);

        //Read the data
        const result = await readFragmentData(ownerId, fragmentId);

        expect(result).toEqual(buffer);
    })


    //!TEST CASE NO:3
    test('listFragments should return a list of fragments IDs or metadata', async() => {
        const fragment1 = {
            id: '123',
            ownerId: 'user1',
            type: 'text/plain',
        };
        const fragment2 = {
            id: '456',
            ownerId: 'user1',   
            type: 'text/plain'
        };

        //Write the fragments
        await writeFragment(fragment1);
        await writeFragment(fragment2);

        //Get list of fragment IDs
        const ids = await listFragments('user1', false);
        expect(ids).toEqual(['123', '456']);

        //Get expanded fragments metadata
        const expandedFragments = await listFragments('user1', true);
        expect(expandedFragments).toEqual([fragment1, fragment2]);
    });

    //!TEST CASE NO: 3
    test('deleteFragment should remove both metadata and data', async() => {
        const fragment = {
            id: '123',
            ownerId: 'user1',
            type: 'text/plain',
            content: 'Test content'
        };
        const buffer = Buffer.from('Test content');

        //Write the fragment
        await writeFragment(fragment);
        await writeFragmentData(fragment.ownerId, fragment.id, buffer);

        //Delete the fragment
        await deleteFragment(fragment.ownerId, fragment.id);

        //Read the fragment
        const metadataResult = await readFragment(fragment.ownerId, fragment.id);
        const dataResult = await readFragmentData(fragment.ownerId, fragment.id);

        expect(metadataResult).toBe(undefined);
        expect(dataResult).toBe(undefined);
    })

    //!TEST CASE NO: 4
    test('readFragment should return undefined for non-existent fragment', async () => {
        const result = await readFragment('user1', 'nonExistentId');
        expect(result).toBeUndefined();
      });
      
      test('deleteFragment should resolve even when fragment does not exist', async () => {
        await expect(deleteFragment('user1', 'nonExistentId')).resolves.toBe(false);
      });
})
