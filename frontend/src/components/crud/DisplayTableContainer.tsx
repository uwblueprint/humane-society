/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import React, { useState, useEffect } from "react";
import BTable from "react-bootstrap/Table";
import { HeaderGroup, useTable, Column } from "react-table";

import EntityAPIClient, {
  EntityResponse,
} from "../../APIClients/EntityAPIClient";
import { downloadCSV } from "../../utils/CSVUtils";
import { downloadFile } from "../../utils/FileUtils";

type EntityData = Omit<EntityResponse, "boolField"> & { boolField: string };

const convert = (entityResponse: EntityResponse): EntityData => {
  return {
    id: entityResponse.id,
    stringField: entityResponse.stringField,
    intField: entityResponse.intField,
    stringArrayField: entityResponse.stringArrayField,
    enumField: entityResponse.enumField,
    boolField: entityResponse.boolField.toString(),
    fileName: entityResponse.fileName,
  };
};

type TableProps = {
  data: EntityData[];
  downloadEntityFile: (fileUUID: string) => void;
};

const createColumns = (
  downloadEntityFile: (fileUUID: string) => void,
): Column<EntityData>[] => [
  {
    Header: "id",
    accessor: "id", // accessor is the "key" in the data
  },
  {
    Header: "stringField",
    accessor: "stringField", // accessor is the "key" in the data
  },
  {
    Header: "integerField",
    accessor: "intField",
  },
  {
    Header: "stringArrayField",
    accessor: "stringArrayField",
  },
  {
    Header: "enumField",
    accessor: "enumField",
  },
  {
    Header: "boolField",
    accessor: "boolField",
  },
  {
    Header: "fileName",
    accessor: "fileName",
    // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
    Cell: ({ cell }: any) =>
      // TODO: lookup the proper type of the prop
      cell.row.values.fileName ? (
        <button
          type="button"
          onClick={() => downloadEntityFile(cell.row.values.fileName)}
        >
          Download
        </button>
      ) : null,
  },
];

const DisplayTable = ({ data, downloadEntityFile }: TableProps) => {
  const { getTableProps, headerGroups, rows, prepareRow } =
    useTable<EntityData>({
      columns: createColumns(downloadEntityFile),
      data,
    });

  return (
    <BTable
      striped
      bordered
      hover
      size="sm"
      {...getTableProps()}
      style={{ marginTop: "20px" }}
    >
      <thead>
        {headerGroups.map((headerGroup: HeaderGroup<EntityData>) => (
          // Key is specified in the prop getter functions
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </BTable>
  );
};

const DisplayTableContainer: React.FC = (): React.ReactElement | null => {
  const [entities, setEntities] = useState<EntityData[] | null>(null);

  useEffect(() => {
    const retrieveAndUpdateData = async () => {
      const result = await EntityAPIClient.get();
      if (result) {
        setEntities(result.map((r: EntityResponse) => convert(r)));
      }
    };
    retrieveAndUpdateData();
  }, []);

  const downloadEntityFile = async (fileUUID: string) => {
    const data = await EntityAPIClient.getFile(fileUUID);
    if (data) {
      downloadFile(data, "file");
    } else {
      console.error("Failed to download file: data is null");
    }
  };

  const downloadEntitiesCSV = async () => {
    if (entities) {
      const csvString = await EntityAPIClient.getCSV();
      if (csvString) {
        downloadCSV(csvString, "export.csv");
      } else {
        console.error("Failed to download CSV: csvString is null");
      }
      // Use the following lines to download CSV using frontend CSV generation instead of API
      // const csvString = await generateCSV<EntityData>({ data: entities });
      // downloadCSV(csvString, "export.csv");
    }
  };

  return (
    <>
      <button type="button" onClick={downloadEntitiesCSV}>
        Download CSV
      </button>
      {entities && (
        <DisplayTable data={entities} downloadEntityFile={downloadEntityFile} />
      )}
    </>
  );
};

export default DisplayTableContainer;
