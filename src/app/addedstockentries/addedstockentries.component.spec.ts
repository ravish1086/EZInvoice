import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedstockentriesComponent } from './addedstockentries.component';

describe('AddedstockentriesComponent', () => {
  let component: AddedstockentriesComponent;
  let fixture: ComponentFixture<AddedstockentriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddedstockentriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddedstockentriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
