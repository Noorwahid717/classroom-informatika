"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { cn } from "./cn";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  caption?: string;
}

export function DataTable<TData, TValue>({ columns, data, caption }: DataTableProps<TData, TValue>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="overflow-hidden rounded-md border border-border">
      {caption ? <div className="border-b border-border bg-muted px-4 py-2 text-sm font-medium">{caption}</div> : null}
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 font-semibold text-muted-foreground">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={cn("px-4 py-2", cell.column.id === "status" && "font-semibold")}> 
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
