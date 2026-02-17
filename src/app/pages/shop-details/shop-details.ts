import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-shop-details',
  imports: [CommonModule, Header, Footer],
  templateUrl: './shop-details.html',
  styleUrl: './shop-details.scss',
})
export class ShopDetails {
  // All theme initialization is handled by the Header component
}
