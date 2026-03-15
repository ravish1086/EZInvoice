import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatenegativeinvoiceComponent } from './createnegativeinvoice.component';

describe('CreatenegativeinvoiceComponent', () => {
  let component: CreatenegativeinvoiceComponent;
  let fixture: ComponentFixture<CreatenegativeinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatenegativeinvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatenegativeinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
