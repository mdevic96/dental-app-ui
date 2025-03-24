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

  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '';
  
    const formattedDate = formatDate(date, 'MMMM d, yyyy', 'en-US');
    const formattedTime = formatDate(`1970-01-01T${time}`, 'h:mm a', 'en-US');
  
    return `${formattedDate} - ${formattedTime}`;
  }
  
  
  
}
