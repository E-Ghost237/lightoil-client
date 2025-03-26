import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTankComponent } from './table-tank.component';

describe('TableTankComponent', () => {
  let component: TableTankComponent;
  let fixture: ComponentFixture<TableTankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableTankComponent]
    });
    fixture = TestBed.createComponent(TableTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
