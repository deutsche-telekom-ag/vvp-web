/*
 * Developed by Nicholas Dehnen & Vincent Scharf.
 * Copyright (c) 2019 Deutsche Telekom Intellectual Property.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function TabPages(tabElement) {
    this.myTabElement = tabElement;
}

TabPages.prototype = {
    tabPageSelector: function (sender, tabElement) {
        $('div[data-tabs=' + tabElement + '] div[data-tab-page]').hide();
        $('div[data-tabs=' + tabElement + '] a[data-tab-page]').removeClass('active');
        var tabPage = $(sender).attr('data-tab-page');
        $('div[data-tabs=' + tabElement + '] div[data-tab-page=' + tabPage + ']').show();
        $('div[data-tabs=' + tabElement + '] a[data-tab-page=' + tabPage + ']').addClass('active');
    },

    initTabs: function () {
        $('div[data-tabs=' + this.myTabElement + '] div[data-tab-page]').hide();
        $('div[data-tabs=' + this.myTabElement + '] div[data-tab-page]').first().show();
        $('div[data-tabs=' + this.myTabElement + '] a[data-tab-page]').first().addClass('active');

        //$('div[data-tabs=' + this.myTabElement + '] a[data-tab-page]')
        //	.attr('onclick', "TabPages.tabPageSelector(this, '" + this.myTabElement + "');");
    },

    selectTab: function (tabPage) {
        $('div[data-tabs=' + this.myTabElement + '] div[data-tab-page]').hide();
        $('div[data-tabs=' + this.myTabElement + '] a[data-tab-page]').removeClass('active');
        $('div[data-tabs=' + this.myTabElement + '] div[data-tab-page=' + tabPage + ']').show();
        $('div[data-tabs=' + this.myTabElement + '] a[data-tab-page=' + tabPage + ']').addClass('active');
    },

    init: function (tabElement) {
        var myTabElement = new TabPages('myTabPage');
        myTabElement.initTabs();
        return myTabElement;
    }
};
TabPages.tabPageSelector = TabPages.prototype.tabPageSelector;
TabPages.init = TabPages.prototype.init;