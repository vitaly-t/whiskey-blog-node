const expect = require('chai').expect,
      db = require('../models/_db').db;

describe('Database connection', function () {

  before(function (done) {
    const cmd = `CREATE TABLE IF NOT EXISTS test_table(
                   id SERIAL,
                   text_col TEXT,
                   bool_col BOOL
                 )`;
    db.none(cmd)
      .then(() => done())
      .catch(e => console.error(e));
  });

  after(function (done) {
    db.none('DROP TABLE test_table')
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Inserts a record', function (done) {
    db.one('INSERT INTO test_table(text_col, bool_col) VALUES($1, $2) RETURNING id', ['test', true])
      .then(data => {
        expect(data.id).to.be.a.number;
        expect(data.id).to.equal(1);
        done();
      })
      .catch(e => {
        expect(true).to.be.false;
        done();
      });
  });

  it('Retrieves a record', function (done) {
    db.one('SELECT * FROM test_table')
      .then(data => {
        expect(data.id).to.be.a.number;
        expect(data.text_col).to.be.a.string;
        expect(data.bool_col).to.be.a.boolean;
        done();
      })
      .catch(e => {
        expect(true).to.be.false;
        done();
      });
  });

  it('Retrieves multiple records', function (done) {
    const values = ['foo', false, 'bar', true, 'baz', true, 'foobar', false];
    db.none('INSERT INTO test_table(text_col, bool_col) VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8)', values)
      .then(() => {
        db.many('SELECT * FROM test_table')
          .then(data => {
            expect(data).to.not.be.null;
            expect(data).to.be.a.array;
            expect(data.length).to.equal(5);
            expect(data[0]).to.be.a.object;
            expect(data[0].id).to.be.a.number;
            expect(data[0].text_col).to.be.a.string;
            expect(data[0].bool_col).to.be.a.boolean;
            done();
          })
          .catch(e => {throw e});
      })
      .catch(e => {throw e});
  });

  it('Retrieves multiple records with a WHERE clause', function (done) {
    db.many('SELECT * FROM test_table WHERE bool_col = TRUE')
      .then(data => {
        expect(data).to.not.be.null;
        expect(data).to.be.a.array;
        expect(data.length).to.equal(3);
        done();
      })
      .catch(e => {throw e});
  });
});
