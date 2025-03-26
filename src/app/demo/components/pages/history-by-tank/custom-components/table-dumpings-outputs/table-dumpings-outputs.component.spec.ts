import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDumpingsOutputsComponent } from './table-dumpings-outputs.component';

describe('TableDumpingsOutputsComponent', () => {
  let component: TableDumpingsOutputsComponent;
  let fixture: ComponentFixture<TableDumpingsOutputsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableDumpingsOutputsComponent]
    });
    fixture = TestBed.createComponent(TableDumpingsOutputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
