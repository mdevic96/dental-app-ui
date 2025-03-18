import { formatDate } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation',
  imports: [
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    return formatDate(dateTimeString, 'MMMM d, yyyy - h:mm a', 'en-US');
  }
}
