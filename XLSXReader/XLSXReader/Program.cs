using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Diagnostics;
using System.Xml;
using System.Data.OleDb;
using System.Data;

namespace XLSXReader
{
    class Program
    {
        static void Main(string[] args)
        {
            // If the sheetname is not provided, use the default sheet name
            string strSSFileName = string.Empty, strSheetName = "Sheet1";  
            
            //Parse the args parameter to figure the xlsx file location. 
            if (args.Length == 0 || args.Length > 2)
            {
                Console.WriteLine(".XLSX file name is not provided as input parameter.");
                Console.WriteLine("Usage: XLSXReader.exe XLSXFileName<Required> SheetName<Optional>");
                return;
            }

            if (args.Length >= 1)
            {
                if (args[0] == "?" || args[0] == "/?")
                {
                    Console.WriteLine("Usage: XLSXReader.exe XLSXFileName<Required> SheetName<Optional>");
                    Console.WriteLine("Example: XLSXReader.exe Calibration.xlsx Sheet1");
                    return;
                }
                strSSFileName = args[0];
            }

            if (args.Length >= 2)
                strSheetName = args[1];

            //// Ensure the sharedstrings file exists. 
            if (File.Exists(strSSFileName))
                ReadXLSXFileUsingOleDB(strSSFileName, strSheetName);
            else
            {
                Console.WriteLine("File name specified in the command prompt doesn't exist. File name specified....:" + strSSFileName);
                return;                
            }     
        }

        private static void ReadXLSXFileUsingOleDB(string strFileName, string strSheetName)
        {
            string Connection = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=D:" + strFileName + ";Extended Properties=\"Excel 12.0;HDR=Yes;IMEX=1\";";

            //code to read the content of format file 

            OleDbConnection con = new OleDbConnection(Connection);

            OleDbCommand command = new OleDbCommand();

            DataTable dt = new DataTable();
            try
            {
                OleDbDataAdapter myCommand = new OleDbDataAdapter("select * from [" + strSheetName + "$]", con);
                myCommand.Fill(dt);
            }
            catch (Exception e)
            {
                Console.WriteLine("Incorrect Sheet Name provided." );
                Console.WriteLine("No Sheet with the name {0} exists", strSheetName);
                return;
            }

            //Create a file.
            StreamWriter writer = new StreamWriter("StackRankDetails.txt", false);
            
            foreach( DataColumn column in dt.Columns){
                writer.Write( column.Caption + ",");
            }
            writer.Write( Environment.NewLine );
            foreach (DataRow row in dt.Rows)
            {
                if (row.ItemArray != null)
                {
                    for (int iLoop = 0; iLoop < row.ItemArray.Length; iLoop++)
                    {
                        if ( iLoop != row.ItemArray.Length - 1)
                            writer.Write(row.ItemArray[iLoop].ToString() + ",");
                        else
                            writer.Write(row.ItemArray[iLoop].ToString());
                    }
                    writer.Write(Environment.NewLine);
                }
            }
            con.Close();
            writer.Close();
        }

    }
}
