import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedproductsComponent } from './addedproducts.component';

describe('AddedproductsComponent', () => {
  let component: AddedproductsComponent;
  let fixture: ComponentFixture<AddedproductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddedproductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddedproductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
