import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as TransactionUtils from '../libs/TransactionUtils';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import reportPropTypes from './reportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';
import * as IOU from '../libs/actions/IOU';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report object for the thread report */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function EditRequestPage({report, route}) {
    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const transactionID = ReportActionsUtils.getLinkedTransactionID(ReportUtils.getParentReport(report), parentReportAction)
    const transaction = TransactionUtils.getTransaction(transactionID);
    const transactionDescription = TransactionUtils.getDescription(transaction);
    const transactionAmount = TransactionUtils.getAmount(transaction);
    const transactionCurrency = TransactionUtils.getCurrency(transaction);
    const transactionCreated = TransactionUtils.getCreated(transaction);
    const field = lodashGet(route, ['params', 'field'], '');

    function updateTransactionWithChanges(changes) {
        // Update the transaction...
        // eslint-disable-next-line no-console
        console.log({changes});

        IOU.editIOUTransaction(transactionID, report.reportID, changes);

        // Note: The "modal" we are dismissing is the MoneyRequestAmountPage
        Navigation.dismissModal();
    }

    if (field === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(changes) => {
                    updateTransactionWithChanges(changes);
                }}
            />
        );
    } else if (field === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={transactionCreated}
                onSubmit={(changes) => {
                    updateTransactionWithChanges(changes);
                }}
            />
        );
    } else if (field === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return null;
    }

    return null;
}

EditRequestPage.displayName = 'EditRequestPage';
EditRequestPage.propTypes = propTypes;
EditRequestPage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`,
        },
    }),
)(EditRequestPage);
