// @ts-nocheck
const ezs = require('ezs');
const from = require('from');
const { removeQueryAndFilters } = require('../utils');

const script = removeQueryAndFilters(__dirname + '/jsonld.ini');

const fields = [
    {
        cover: 'collection',
        scheme: 'http://purl.org/dc/terms/title',
        name: 'Q98n',
    },
    {
        cover: 'dataset',
        scheme: 'http://purl.org/dc/terms/title',
        name: 'qW6w',
    },
];

test('export single property', done => {
    let outputString = '';
    from([{
        uri: 'http://data.istex.fr',
        Q98n: 'Terminator',
    }])
        .pipe(ezs('delegate', { script }, { fields }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            expect(outputString).toEqual('[{"@id":"http://data.istex.fr","Q98n":"Terminator","@context":{"Q98n":{"@id":"http://purl.org/dc/terms/title"}}}]');
            done();
        })
        .on('error', done);
});

// This test should used on the jsonld-dataset.ini version of the exporter
// When (if?) it will be written.
test.skip('export dataset characteristics too', done => {
    let outputString = '';
    const characteristics = [{
        qW6w: 'Dataset Title',
    }];
    from([{
        uri: 'http://data.istex.fr/1',
        Q98n: 'Terminator',
        qW6w: 'Dataset Title',
    }])
    .pipe(ezs('delegate', { script }, {
        cleanHost: 'http://data.istex.fr',
        schemeForDatasetLink: 'http://scheme.for.dataset/link',
        datasetClass: 'http://dataset.class',
        collectionClass: 'http://collection.class',
        exportDataset: true,
        fields,
        characteristics }))
    .on('data', data => {
        if (data) outputString += data;
    })
    .on('end', () => {
        expect(JSON.parse(outputString)).toEqual([{
            '@id': 'http://data.istex.fr/1',
            '@type': 'http://collection.class',
            Q98n: 'Terminator',
            '@context': {
                Q98n: { '@id': 'http://purl.org/dc/terms/title' },
                dataset: { '@id': 'http://scheme.for.dataset/link' },
            },
            dataset: {
                qW6w: 'Dataset Title',
                '@context': {
                    qW6w: { '@id': 'http://purl.org/dc/terms/title' },
                },
                '@id': 'http://data.istex.fr',
                '@type': 'http://dataset.class',
            }
        }]);
        done();
    })
    .on('error', done);
});
