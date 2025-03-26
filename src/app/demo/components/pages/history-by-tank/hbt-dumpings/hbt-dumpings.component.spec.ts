import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HbtDumpingsComponent } from './hbt-dumpings.component';

describe('HbtDumpingsComponent', () => {
  let component: HbtDumpingsComponent;
  let fixture: ComponentFixture<HbtDumpingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HbtDumpingsComponent]
    });
    fixture = TestBed.createComponent(HbtDumpingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
