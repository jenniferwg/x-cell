const fs = require('fs');
const TableModel = require('../table-model');
const TableView = require('../table-view');

describe('table-view', () => {

  beforeEach(() => {
    // load HTML skeleton from disk and parse into the DOM
    const fixturePath = './client/js/test/fixtures/sheet-container.html';
    const html = fs.readFileSync(fixturePath, 'utf8');
    document.documentElement.innerHTML = html;
  });

  describe('add row and column buttons', () => {
    it('adds a row below the highlighted row', () => {
      //set up initial state
      const model = new TableModel(3, 3);
      model.setValue({col: 1, row: 0}, 'noshift');
      model.setValue({col: 1, row: 2}, 'shift');
      const view = new TableView(model);
      view.init()

      // inspect the initial state
      let trs = document.querySelectorAll('TBODY TR');
      expect(model.numCols).toBe(3);
      expect(model.numRows).toBe(3);
      expect(trs[2].cells[1].textContent).toBe('shift');

      // simulate user action
      trs[1].cells[0].click();
      view.handleAddRow();

      // inspect the resulting state
      trs = document.querySelectorAll('TBODY TR');
      expect(model.numCols).toBe(3);
      expect(model.numRows).toBe(4);
      expect(trs[0].cells[1].textContent).toBe('noshift');
      expect(trs[3].cells[1].textContent).toBe('shift');
      expect(trs[2].cells[1].textContent).toBe('');
    })

    it('adds a column to the right of highlighted column', () => {
      //set up initial state
      const model = new TableModel(3, 3);
      model.setValue({col: 1, row: 2}, 'noshift');
      model.setValue({col: 2, row: 0}, 'shift');
      const view = new TableView(model);
      view.init()

      // inspect the initial state
      expect(model.numCols).toBe(3);
      expect(model.numRows).toBe(3);

      // simulate user action
      let ths = document.querySelectorAll('THEAD TR');
      ths[0].cells[1].click();
      view.handleAddCol();

      // inspect the resulting state
      let trs = document.querySelectorAll('TBODY TR');
      expect(model.numCols).toBe(4);
      expect(model.numRows).toBe(3);
      expect(trs[2].cells[1].textContent).toBe('noshift');
      expect(trs[0].cells[2].textContent).toBe('shift');
      expect(trs[0].cells[1].textContent).toBe('');
    })

    it('adds a row and column', () => {
      // set up initial state
      const model = new TableModel(2, 2);
      const view = new TableView(model);
      view.init()

      // inspect the initial state
      expect(model.numCols).toBe(2);
      expect(model.numRows).toBe(2);

      // simulate user action
      view.handleAddRow();
      view.handleAddCol();

      // inspect the resulting state
      expect(model.numCols).toBe(3);
      expect(model.numRows).toBe(3);
    })
  })

  describe('table footer', () => {
    it('calculates sum of valid positive values', () => {
      // set up initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '5');
      model.setValue({col: 2, row: 2}, '3');
      view.init()

      // inspect the initial state
      let tfs = document.querySelectorAll('TFOOT TR');
      expect(tfs[0].cells[2].textContent).toBe('8');
    })

    it('calculates sum of valid negative values', () => {
      // set up initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '5');
      model.setValue({col: 2, row: 2}, '-5');
      view.init()

      // inspect the initial state
      let tfs = document.querySelectorAll('TFOOT TR');
      expect(tfs[0].cells[2].textContent).toBe('0');
    })

    it('ignores invalid values', () => {
      // set up initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '5');
      model.setValue({col: 2, row: 2}, 'invalid');
      model.setValue({col: 3, row: 3}, '#*$&');
      view.init()

      // inspect the initial state
      let tfs = document.querySelectorAll('TFOOT TR');
      expect(tfs[0].cells[2].textContent).toBe('5');
      expect(tfs[0].cells[3]).toBeUndefined();
    })
  })

  describe('formula bar', () => {
    it('makes changes TO the value of the current cell', () => {
      // set up the initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      view.init();
      view.currentCellLocation = {col: 1, row: 0};

      // inspect the initial state
      let trs = document.querySelectorAll('TBODY TR');
      let td = trs[0].cells[1];
      expect(td.textContent).toBe('');

      // simulate user action
      document.querySelector('#formula-bar').value = '65';
      view.handleFormulaBarChange();

      // inspect the resulting state
      trs = document.querySelectorAll('TBODY TR');
      expect(trs[0].cells[1].textContent).toBe('65');
    })

    it('updates FROM the value of the current cell', () => {
      // set up the initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '123');
      view.init();

      // inspect the initial state
      const formulaBarEl = document.querySelector('#formula-bar');
      expect(formulaBarEl.value).toBe('');

      // simulate user action
      const trs = document.querySelectorAll('TBODY TR');
      trs[1].cells[2].click();

      //inspect the resulting state
      expect(formulaBarEl.value).toBe('123');
    })
  })

  describe('table body', () => {
    it('highlights the current row when clicked', () => {
      // set up the initial state 
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      view.init();

      // inspect initial state
      let multiple = document.getElementsByClassName('current-multiple');
      expect(multiple.length).toBe(0);

      // simulate user action
      const ths = document.querySelectorAll('TBODY TR');
      ths[1].cells[0].click();

      // inspect the resulting state
      const formulaBarEl = document.querySelector('#formula-bar');
      multiple = document.getElementsByClassName('current-multiple');
      expect(multiple.length).toBe(3);
      expect(formulaBarEl.value).toBe(' < row 2 is selected > ');
      expect(view.currentCellLocation).toBe('');
    })

    it('highlights the current column when clicked', () => {
      // set up the initial state 
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      view.init();

      // inspect initial state
      let multiple = document.getElementsByClassName('current-multiple');
      expect(multiple.length).toBe(0);

      // simulate user action
      const ths = document.querySelectorAll('THEAD TR');
      ths[0].cells[2].click();

      // inspect the resulting state
      const formulaBarEl = document.querySelector('#formula-bar');
      multiple = document.getElementsByClassName('current-multiple');
      expect(multiple.length).toBe(3);
      expect(formulaBarEl.value).toBe(' < column B is selected > ');
      expect(view.currentCellLocation).toBe('');
    })

    it('highlights the current cell when clicked', () => {
      // set up the initial state
      const model = new TableModel(10, 5);
      const view = new TableView(model);
      view.init();

      // inspect the initial state
      let trs = document.querySelectorAll('TBODY TR');
      let td = trs[2].cells[3];
      expect(td.className).toBe('');

      // simulate user action
      td.click();

      // inspect the resulting state
      trs = document.querySelectorAll('TBODY TR');
      td = trs[2].cells[3];
      expect(td.className).not.toBe('');
    })

    it('has the right size', () => {
      // set up the initial state
      const numCols = 6;
      const numRows = 10;
      const model = new TableModel(numCols, numRows);
      const view = new TableView(model);
      view.init();

      // inspect the initial state 
      let ths = document.querySelectorAll('THEAD TH');
      expect(ths.length).toBe(numCols);
    });

    it('fills in values from the model', () => {
      // set up the initial state
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '123');
      view.init();

      // inspect the initial state
      const trs = document.querySelectorAll('TBODY TR');
      expect(trs[1].cells[2].textContent).toBe('123');
    });
  });

  describe('table header', () => {
    it('has valid column header labels', () => {
      // set up the initial state
      const numCols = 6;
      const numRows = 10;
      const model = new TableModel(numCols, numRows);
      const view = new TableView(model);
      view.init();

      // inspect the initial state
      let ths = document.querySelectorAll('THEAD TH');
      expect(ths.length).toBe(numCols);

      let labelTexts = Array.from(ths).map(el => el.textContent);
      expect(labelTexts).toEqual(['', 'A', 'B', 'C', 'D', 'E']);
    });

  });

});