import {Component} from '@angular/core';

import {MenuItem} from "primeng/api";
import {Order, Transaction, Type} from 'src/app/models/stock-exchange.model';
import {TransactionsArrayService} from "../../../services/transactions-array.service";
import { StockService } from 'src/app/services/stock.service';


@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent {

  breadcrumbItems: MenuItem[];

  transactions: Transaction[]

  orders: Order[]

  temp: Order



  loading: boolean = true;

  status!: any[];

  constructor(private transactionService: TransactionsArrayService, private  stockService: StockService) {

  }


  ngOnInit() {
    this.breadcrumbItems = [
      {label: 'Početna', routerLink: ['/home']},
      {label: 'Porudžbine', routerLink: ['/purchases']}
    ];

    this.status = [
      {label: 'Sve', value: ''},
      {label: 'Završene', value: 'ZAVRSENA'},
      {label: 'U toku', value: 'U TOKU'},
      {label: 'Odbijene', value: 'ODBIJENA'},
      {label: 'Na čekanju', value: 'NA CEKANJU'}
    ]

    this.transactions = this.transactionService.getTransactions()
    this.getOrdersFromBack()
  }

  private getOrdersFromBack(): void {
    this.stockService.getAllOrders().subscribe({
      next: val => {
        this.orders=val
        console.log(this.orders)
        
        for(var o in this.orders)
        {
          if(this.orders[o].status==='WAITING'){
            this.orders[o].status='NA CEKANJU' 
          }
          if(this.orders[o].status==='DENIED'){
            this.orders[o].status='ODBIJENA' 
          }
          if(this.orders[o].status==='IN_PROGRESS'){
            this.orders[o].status='U TOKU' 
          }
          if(this.orders[o].status==='COMPLETE'){
            this.orders[o].status='ZAVRSENA' 
          }
        }
      } 

    });
  }

  refresh() {

    //TODO ovde ide logika i poziv na servis koji ce pozvati refresh i resetovati tabelu na berza mode
    //I odmah za njim i filtriranje za userove hartije
    // this.loading = true;
    // this.stocks-table = []
    // setTimeout(()=>{
    //   this.insertUsers()
    //   this.BuySellOption = true
    //   this.switch = false
    //   this.loading = false
    // }, 2000);

  }


}
