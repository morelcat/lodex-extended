const ezs = require('ezs');
const from = require('from');

const localConfig = {
    cleanHost: '',
    schemeForDatasetLink: '',
};

const fields = [
    {
        cover: 'collection',
        scheme: 'http://purl.org/dc/terms/title',
        name: 'Q98n',
    },
    {
        cover: 'collection',
        scheme: 'http://property/a',
        name: 'propa',
        classes: ['http://class/2'],
        composedOf: {
            fields: ['propb'],
        },
    },
    {
        cover: 'collection',
        scheme: 'http://property/b',
        name: 'propb',
    },
    {
        cover: 'dataset',
        scheme: 'http://purl.org/dc/terms/title',
        name: 'qW6w',
    },
];

test('export a single data property', done => {
    let outputString = '';
    from([{ uri: 'http://data.istex.fr', Q98n: 'Terminator' }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, { fields: fields.slice(0, 1) }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(res).toEqual([
                '@prefix dc: <http://purl.org/dc/terms/> .',
                '',
                '<http://data.istex.fr> dc:title "Terminator" .',
                ''
            ]);
            done();
        })
        .on('error', done);
});

test('export an object property (with a class)', done => {
    let outputString = '';
    from([{
        uri: 'http://uri/1',
        propa: 'label a',
        propb: 'value 2',
    }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, { fields: fields.slice(1, 3) }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(res).toEqual([
                '@prefix ns0: <http://property/> .',
                '',
                '<http://uri/1#compose/propa>',
                '  ns0:b "value 2" ;',
                '  a <http://class/2> .',
                '',
                '<http://uri/1> ns0:a <http://uri/1#compose/propa> .',
                ''
            ]);
            done();
        })
        .on('error', done);
});

test('export a composed object property (with a class)', done => {
    let outputString = '';
    from([{
        uri: 'http://uri/1',
        propcomposed: 'label a',
        propb: 'value 1',
        propc: 'value 2',
    }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, {
            fields: [
                {
                    cover: 'collection',
                    scheme: 'http://property/composed',
                    name: 'propcomposed',
                    classes: ['http://class/composed'],
                    composedOf: {
                        fields: ['propb', 'propc'],
                    },
                },
                {
                    cover: 'collection',
                    scheme: 'http://property/b',
                    name: 'propb',
                },
                {
                    cover: 'collection',
                    scheme: 'http://property/c',
                    name: 'propc',
                },
            ]
        }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(res).toEqual([
                '@prefix ns0: <http://property/> .',
                '',
                '<http://uri/1#compose/propcomposed>',
                '  ns0:b "value 1" ;',
                '  ns0:c "value 2" ;',
                '  a <http://class/composed> .',
                '',
                '<http://uri/1> ns0:composed <http://uri/1#compose/propcomposed> .',
                '',
            ]);
            done();
        })
        .on('error', done);
});

test('don\'t export a single data property without value', done => {
    let outputString = '';
    from([{ uri: 'http://data.istex.fr', Q98n: null }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, { fields: fields.slice(0, 1) }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            expect(outputString).toEqual('');
            done();
        })
        .on('error', done);
});

test('export a composed object property (with a class) without number in sub-domain', done => {
    let outputString = '';
    from([{
        uri: 'http://a-b-1.c.d.e/1',
        propcomposed: 'label a',
        propb: 'value 1',
        propc: 'value 2',
    }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, {
            fields: [
                {
                    cover: 'collection',
                    scheme: 'http://property/composed',
                    name: 'propcomposed',
                    classes: ['http://class/composed'],
                    composedOf: {
                        fields: ['propb', 'propc'],
                    },
                },
                {
                    cover: 'collection',
                    scheme: 'http://property/b',
                    name: 'propb',
                },
                {
                    cover: 'collection',
                    scheme: 'http://property/c',
                    name: 'propc',
                },
            ]
        }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(res).toEqual([
                '@prefix ns0: <http://property/> .',
                '',
                '<http://a-b.c.d.e/1#compose/propcomposed>',
                '  ns0:b "value 1" ;',
                '  ns0:c "value 2" ;',
                '  a <http://class/composed> .',
                '',
                '<http://a-b.c.d.e/1> ns0:composed <http://a-b.c.d.e/1#compose/propcomposed> .',
                '',
            ]);
            done();
        })
        .on('error', done);
});

test('export an annotating property without number in sub-domain', done => {
    let outputString = '';
    from([{
        uri: 'http://a-b-1.c.d.e/1',
        completed: 'La chimie minérale (= inorganique) étudie ...',
        completing: [
            'https://fr.wikipedia.org/wiki/Chimie_inorganique',
        ],
    }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, {
            fields: [
                {
                    cover: 'collection',
                    scheme: 'http://purl.org/dc/terms/description',
                    name: 'completed',
                },
                {
                    cover: 'collection',
                    scheme: 'http://purl.org/dc/terms/source',
                    completes: 'completed',
                    name: 'completing',
                },
            ]
        }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(outputString).toContain('#complete/');
            const completing = RegExp('#complete/([^>]*)').exec(
                outputString,
            )[1];
            expect(res).toEqual([
                '@prefix dc: <http://purl.org/dc/terms/> .',
                '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
                '',
                '<http://a-b.c.d.e/1#complete/${completing}>',
                '  dc:source <https://fr.wikipedia.org/wiki/Chimie_inorganique> ;',
                '  rdfs:label "La chimie minérale (= inorganique) étudie ..." .',
                '',
                '<http://a-b.c.d.e/1> dc:description <http://a-b.c.d.e/1#complete/${completing}> .',
                '',
            ]);
            done();
        })
        .on('error', done);
});

test('export a single data property with dataset', done => {
    let outputString = '';
    from([{ uri: 'http://resource.uri', Q98n: 'Terminator', qW6w: 'Dataset Title' }])
        .pipe(ezs('delegate', { file: __dirname + '/turtle.ini' }, {
            cleanHost: 'http://dataset.uri',
            exportDataset: 'true',
            schemeForDatasetLink: 'http://scheme.for.dataset/link',
            datasetClass: 'http://test.fr/datasetClass',
            collectionClass: 'http://collection.class',
            fields: [
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
            ],
            characteristics: [{
                qW6w: 'Dataset Title',
            }]
        }))
        .on('data', data => {
            if (data) outputString += data;
        })
        .on('end', () => {
            const res = outputString.split('\n');
            expect(res).toEqual([
                '@prefix dc: <http://purl.org/dc/terms/> .',
                '@prefix ns0: <http://scheme.for.dataset/> .',
                '',
                '<http://dataset.uri>',
                '  dc:title "Dataset Title" ;',
                '  a <http://test.fr/datasetClass> .',
                '',
                '<http://resource.uri>',
                '  dc:title "Terminator" ;',
                '  ns0:link <http://dataset.uri> ;',
                '  a <http://collection.class> .',
                '',
            ]);
            done();
        })
        .on('error', done);
});
