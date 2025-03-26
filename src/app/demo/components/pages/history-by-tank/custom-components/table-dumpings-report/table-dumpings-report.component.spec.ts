import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDumpingsReportComponent } from './table-dumpings-report.component';

describe('TableDumpingsReportComponent', () => {
  let component: TableDumpingsReportComponent;
  let fixture: ComponentFixture<TableDumpingsReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableDumpingsReportComponent]
    });
    fixture = TestBed.createComponent(TableDumpingsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
