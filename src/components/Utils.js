import styled from "styled-components";

//helper function for styling the error message from the server
export const ErrorMessage = styled.div`
          color: #dd1818;
          margin-left: 5px;
          padding: 3px;
`;

// formatting the number to indian currency
export const currencyFormatter = new Intl.NumberFormat(undefined, {
    currency: 'ind',
    // style: 'currency',
    minimumFractionDigits: 0
})