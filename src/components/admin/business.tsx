import { useAdminGetBusinesses } from "@/hooks/admin"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { IBusinessData } from "@/types/admin";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ActionButtons } from "@/components/admin/admin-components/action-button";

export const AdminBusiness = () => {
  const { data: business } = useAdminGetBusinesses()
  const data = business?.data ?? []
  console.log(data);

  const getColumns = (
    onDelete: (id: string) => void,
    onEdit: (data: IBusinessData) => void
  ): ColumnDef<IBusinessData>[] => [
    {
      accessorKey: "businessName",
      header: "Klinika Nomi",
      cell: ({ row }) => <div className="font-medium">{row.getValue("businessName")}</div>,
    },
    {
      accessorKey: "user.fullName",
      header: "Mas'ul Shaxs",
      cell: ({ row }) => row.original.user.fullName,
    },
    {
      accessorKey: "phone",
      header: "Telefon",
    },
    {
      accessorKey: "isApproved",
      header: "Holati",
      cell: ({ row }) => (
        <Badge variant={row.original.isApproved ? "default" : "destructive"}>
          {row.original.isApproved ? "Active" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <ActionButtons
          data={row.original}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ),
    },
  ];

  const handleDelete = (id: string) => {
    if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      console.log("O'chirilmoqda:", id);
    }
  };

  const handleEdit = (item: IBusinessData) => {
    console.log("Tahrirlanmoqda:", item);
  };

  const columns = getColumns(handleDelete, handleEdit);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Ma'lumot topilmadi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}