'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Exception = (function (_super) {
    __extends(Exception, _super);
    function Exception(msg) {
        if (msg === void 0) { msg = 'Locale Exception'; }
        return _super.call(this, msg) || this;
    }
    return Exception;
}(Error));
exports.Exception = Exception;
var NoChangesException = (function (_super) {
    __extends(NoChangesException, _super);
    function NoChangesException(msg) {
        if (msg === void 0) { msg = ''; }
        return _super.call(this, "There are no changes! " + msg) || this;
    }
    return NoChangesException;
}(Exception));
exports.NoChangesException = NoChangesException;
var UncommitedChanges = (function (_super) {
    __extends(UncommitedChanges, _super);
    function UncommitedChanges(msg) {
        if (msg === void 0) { msg = ''; }
        return _super.call(this, "There are uncommited changes! " + msg) || this;
    }
    return UncommitedChanges;
}(Exception));
exports.UncommitedChanges = UncommitedChanges;
