import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private scriptsLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadThemeScripts();
    }
  }

  private loadThemeScripts() {
    if (this.scriptsLoaded) return;
    this.scriptsLoaded = true;

    const scripts = [
      'assets/theme/js/jquery-3.3.1.min.js',
      'assets/theme/js/bootstrap.min.js',
      'assets/theme/js/jquery.nice-select.min.js',
      'assets/theme/js/jquery.nicescroll.min.js',
      'assets/theme/js/jquery.magnific-popup.min.js',
      'assets/theme/js/jquery.countdown.min.js',
      'assets/theme/js/jquery.slicknav.js',
      'assets/theme/js/mixitup.min.js',
      'assets/theme/js/owl.carousel.min.js',
      'assets/theme/js/main.js'
    ];

    this.loadScriptsSequentially(scripts, 0);
  }

  private loadScriptsSequentially(scripts: string[], index: number) {
    if (index >= scripts.length) {
      // All scripts loaded, initialize theme features
      this.initializeThemeFeatures();
      return;
    }

    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => {
      this.loadScriptsSequentially(scripts, index + 1);
    };
    script.onerror = () => {
      console.error(`Failed to load script: ${scripts[index]}`);
      this.loadScriptsSequentially(scripts, index + 1);
    };
    document.body.appendChild(script);
  }

  private initializeThemeFeatures() {
    // Wait a bit for DOM to be ready and scripts to initialize
    setTimeout(() => {
      // Set background images for elements with data-setbg attribute
      const elements = document.querySelectorAll('.set-bg');
      elements.forEach((element: any) => {
        const bg = element.getAttribute('data-setbg');
        if (bg) {
          element.style.backgroundImage = `url(${bg})`;
        }
      });

      // Initialize owl carousel if present
      const owlCarousel = (window as any).$;
      if (owlCarousel && typeof owlCarousel('.owl-carousel').owlCarousel === 'function') {
        owlCarousel('.hero__slider').owlCarousel({
          loop: true,
          margin: 0,
          items: 1,
          dots: false,
          nav: true,
          navText: ["<span class='arrow_left'><span/>","<span class='arrow_right'><span/>"],
          smartSpeed: 1200,
          autoHeight: false,
          autoplay: true,
        });
      }

      // Hide preloader
      setTimeout(() => {
        const preloader = document.getElementById('preloder');
        if (preloader) {
          preloader.style.display = 'none';
        }
      }, 300);
    }, 100);
  }
}
