import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDumpingsIntputsComponent } from './table-dumpings-intputs.component';

describe('TableDumpingsIntputsComponent', () => {
  let component: TableDumpingsIntputsComponent;
  let fixture: ComponentFixture<TableDumpingsIntputsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableDumpingsIntputsComponent]
    });
    fixture = TestBed.createComponent(TableDumpingsIntputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
