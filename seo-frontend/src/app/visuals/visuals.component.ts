import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-visuals',
  templateUrl: './visuals.component.html',
  styleUrls: ['./visuals.component.css']
})
export class VisualsComponent implements AfterViewInit {
  @ViewChild('barChartCanvas') private barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') private lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    // Word count data
    const wordCountData = [
      { word: 'w1', count: 5 },
      { word: 'w2', count: 8 },
      { word: 'w3', count: 3 },
      // Add more word-count pairs as needed
    ];

    // Algorithm execution time data
    const executionTimeData = [
      { algorithm: 'Rabin-Karp', time: 2.5 },
      { algorithm: 'KMP', time: 3.2 },
      { algorithm: 'Naive', time: 4.1 },
      { algorithm: 'Suffix Tree', time: 2.8 },
    ];

    const barChartCtx = this.barChartCanvas.nativeElement.getContext('2d');
    const lineChartCtx = this.lineChartCanvas.nativeElement.getContext('2d');

    if (barChartCtx && lineChartCtx) {
      // Bar Chart for Word Counts
      new Chart(barChartCtx, {
        type: 'bar',
        data: {
          labels: wordCountData.map(row => row.word),
          datasets: [{
            label: 'Word Count',
            data: wordCountData.map(row => row.count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Word Count',
                font: {
                  size: 14
                }
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              title: {
                display: true,
                text: 'Words',
                font: {
                  size: 14
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          }
        }
      });

      // Line Chart for Execution Times vs Algorithm Names
      new Chart(lineChartCtx, {
        type: 'line',
        data: {
          labels: executionTimeData.map(row => row.algorithm),
          datasets: [{
            label: 'Execution Time',
            data: executionTimeData.map(row => row.time),
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Execution Time',
                font: {
                  size: 14
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Algorithms',
                font: {
                  size: 14
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff'
            }
          }
        }
      });
    }
  }
}
