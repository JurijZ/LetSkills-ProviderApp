import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

@Injectable()
export class PaginationService {

    // pageSize argument controlls how many items to show on the page
    // totalItems - the number of objects in the paginable array
    getPager(totalItems: number, currentPage: number = 1, pageSize: number = 4) {

        // calculate the number of possible pages
        let totalPages = Math.ceil(totalItems / pageSize);

        let startPage: number, endPage: number;

        if (totalPages <= 10) {
            // less than 10 total pages so show all 10 buttons on the screen
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages (sliding window)
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        //let pages = _.range(startPage, endPage + 1); // this uses underscore library hence replaced with hand written
        let pages = [];
        for (var i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

}