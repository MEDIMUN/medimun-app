export default function formatDateForInput ( date ) {
   if ( !date ) {
      return "";
   }
   // Extract the year, month, and day from the date object
   const year = date.getFullYear();
   const month = date.getMonth() + 1; // Adding 1 because months are 0-indexed
   const day = date.getDate();

   // Format month and day to ensure they are in 'MM' or 'DD' format
   const formattedMonth = month < 10 ? `0${ month }` : month;
   const formattedDay = day < 10 ? `0${ day }` : day;

   // Return the formatted date string in 'YYYY-MM-DD' format
   return `${ year }-${ formattedMonth }-${ formattedDay }`;
}