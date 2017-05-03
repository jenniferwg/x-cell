const { getLetterRange, getLetter } = require('./array-util');
const { removeChildren, createTH, createTR, createTD } = require('./dom-util');

class TableView {
  constructor(model) {
    this.model = model;
  }

  init() {
    this.initDomReferences();
    this.initCurrentCell();
    this.renderTable();
    this.attachEventHandlers();
  }

  initDomReferences() {
    this.headerRowEl = document.querySelector('THEAD TR');
    this.sheetBodyEl = document.querySelector('TBODY');
    this.formulaBarEl = document.querySelector('#formula-bar');
    this.footerRowEl = document.querySelector('TFOOT TR');
    this.addRowEl = document.querySelector('#add-row');
    this.addColEl = document.querySelector('#add-col');
  }

  initCurrentCell() {
    this.currentCellLocation = { col: 1, row: 0 };
    this.renderFormulaBar();
  }

  normalizeValueForRendering(value) {
    return value || '';
  }

  renderFormulaBar() {
    this.formulaBarEl.disabled = false;
    const currentCellValue = this.model.getValue(this.currentCellLocation);
    this.formulaBarEl.value = this.normalizeValueForRendering(currentCellValue);
    
    if (this.isColSelect || this.isRowSelect) {
      if (this.isColSelect) {
        this.formulaBarEl.value = ' < column ' + (getLetter('A', this.isColSelect)) + ' is selected > ';
      } else {
        this.formulaBarEl.value = ' < row ' + (this.isRowSelect) + ' is selected > ';
      }
      this.formulaBarEl.disabled = true;
    }

    this.formulaBarEl.focus();
  }

  renderTable() {
    this.renderTableHeader();
    this.renderTableBody();
    this.renderTableFooter();
  }

  renderTableHeader() {
    removeChildren(this.headerRowEl);
    this.headerRowEl.appendChild(createTH());
    getLetterRange('A', this.model.numCols - 1)
      .map(colLabel => createTH(colLabel))
      .forEach(th => this.headerRowEl.appendChild(th));
  }

  isCurrentCell(col, row) {
    return this.currentCellLocation.row === row && 
        this.currentCellLocation.col === col;
  }

  shiftCellValues() {
    for (let row = this.model.numRows - 1; row > 0; row--) {
      for (let col = this.model.numCols - 1; col > 0; col--) {
        if (this.addRowAfter && row > this.isRowSelect) {
          let currentValue = this.model.getValue({ col: col, row: row - 1 });
          this.model.setValue({ col: col, row: row }, currentValue);
          this.model.setValue({ col: col, row: row - 1 }, '');
        }

        if (this.addColAfter && col > this.isColSelect) {
          let currentValue = this.model.getValue({ col: col, row: row});
          this.model.setValue({ col: col + 1, row: row }, currentValue);
          this.model.setValue({ col: col, row: row }, '');
        }
      }
    }
    this.addRowAfter = false;
    this.addColAfter = false;
  }

  renderTableBody() {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < this.model.numRows; row++) {
      const tr = createTR();
      for (let col = 0; col < this.model.numCols; col++) {
        if (col === 0) { createTD(); }

        if (this.addRowAfter || this.addColAfter) {
          this.shiftCellValues(); 
        }

        const position = { col: col, row: row };
        const value = this.model.getValue(position);
        const td = createTD(value);

        if (col === this.isColSelect || row === this.isRowSelect - 1) {
          td.className = 'current-multiple'
        } else if (this.isCurrentCell(col, row)) {
          td.className = 'current-cell';
        }

        tr.appendChild(td);
      }
      fragment.appendChild(tr);
    }
    removeChildren(this.sheetBodyEl);
    this.sheetBodyEl.appendChild(fragment);
  }

  isFirstCol(col) {
    return col === 0;
  }

  isNumericValue(value) {
    return value || value === 0;
  }

  renderTableFooter() {
    removeChildren(this.footerRowEl);
    for (let col = 0; col < this.model.numCols; col++) {
      let sum = 0;
      let hasValue = false;

      for (let row = 0; row < this.model.numRows; row++) {
        if (this.isFirstCol(col)) {
          sum = 'Sum';
        } else {
          let value = parseInt(this.model.getValue({ col: col, row: row }));
          sum += value || 0;
          if (this.isNumericValue(value)) { hasValue = true; }
        }
      }

      if (sum === 0 && hasValue) { sum = '0'; }
      this.footerRowEl.appendChild(createTD(sum));
    }
  }

  attachEventHandlers() {
    this.sheetBodyEl.addEventListener('click', this.handleSheetClick.bind(this));
    this.headerRowEl.addEventListener('click', this.handleHeaderClick.bind(this));
    this.formulaBarEl.addEventListener('keyup', this.handleFormulaBarChange.bind(this));
    this.addRowEl.addEventListener('click', this.handleAddRow.bind(this));
    this.addColEl.addEventListener('click', this.handleAddCol.bind(this));
  }

  handleAddRow() {
    this.model.numRows += 1;

    if (this.isRowSelect) {
      this.addRowAfter = true;
    }

    this.renderTableBody();
  }

  handleAddCol() {
    this.model.numCols += 1;

    if (this.isColSelect) {
      this.addColAfter = true;
    }

    this.renderTableHeader();
    this.renderTableBody();
    this.renderTableFooter();
  }
  
  handleFormulaBarChange(event) {
    const value = this.formulaBarEl.value;
    this.model.setValue(this.currentCellLocation, value);
    this.renderTableBody();
    this.renderTableFooter();
  }

  handleHeaderClick(event) {
    const col = event.target.cellIndex;

    if (!this.isFirstCol(col)) {
      this.isColSelect = col;

      this.currentCellLocation = '';
      this.isRowSelect = false;
      this.renderTableBody();
      this.renderFormulaBar();
    }
  }

  handleSheetClick(event) {
    const col = event.target.cellIndex;
    const row = event.target.parentElement.rowIndex - 1;

    if (this.isFirstCol(col)) {
      this.isRowSelect = row + 1;
      this.currentCellLocation = '';
      this.isColSelect = false;
   } else {
      this.currentCellLocation = { col: col, row: row };
      this.isColSelect = false;
      this.isRowSelect = false;
   }

    this.renderTableBody();
    this.renderFormulaBar();
  }
}

module.exports = TableView;