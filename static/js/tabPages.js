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