import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, Header, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  // All theme initialization is handled by the Header component
}
