import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  template: `
    <h1 mat-dialog-title>Plain Content from Web Page</h1>
    <div mat-dialog-content>
      {{content}}
    </div>
    <div class="d-flex justify-content-end" mat-dialog-actions>
      <button mat-button color="warn" (click)="dialogRef.close()">Close</button>
    </div>
  `
})
export class DialogContent {
  constructor(
    public dialogRef: MatDialogRef<DialogContent>,
    @Inject(MAT_DIALOG_DATA) public content: string,
  ) {
  }
}
