import { FormGroup } from "@angular/forms";

export const updateControlsValidity = (form: FormGroup): void => {
  Object.values(form.controls).forEach((control) => {
    if (control.invalid) {
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true });
    }
  });
};
