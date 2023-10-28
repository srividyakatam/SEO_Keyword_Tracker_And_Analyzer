import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements AfterViewInit {
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() columns: Columns[] = [];
  @Output('rowClick') rowClick = new EventEmitter<TableEvent>();

  input: string = '';

  constructor() {

  }

  get columnValues() {
    return this.columns.map(c => c.value);
  }

  get columnNames() {
    return this.columns.map(c => c.name);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public search(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.input = filterValue
  }

  emit(element: any) {
    console.log('emit', element)
    this.rowClick.emit({type: 'rowClick', value: element});
  }
}

export interface Columns {
  name: string;
  value: string;
  tooltip?: string;
}

export interface TableData {
  columns: Columns[];
  dataSource: MatTableDataSource<any>;
}

export interface TableEvent {
  type: string;
  value: any;
}
