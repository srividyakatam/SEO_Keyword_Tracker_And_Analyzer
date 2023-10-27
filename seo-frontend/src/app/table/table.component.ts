import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-table',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements AfterViewInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columns: { name: string, value: string }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      columns: { name: string, value: string }[],
      dataSource: any
    }
  ) {
    console.log({data})
    try{
      this.columns = data.columns;
      this.dataSource = new MatTableDataSource<any>(data.dataSource);
    }catch(e){
      debugger;
    }
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
}
