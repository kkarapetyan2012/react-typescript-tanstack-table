/// src/components/ProductTable.tsx
import React, { useState, useRef } from 'react';
import {
  createColumnHelper,
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnOrderState,
  Header,
} from '@tanstack/react-table';
import { Product, products as initialProducts } from '../mockData';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Helper for managing columns
const columnHelper = createColumnHelper<Product>();

const DND_ITEM_TYPE = 'column';

interface DragItem {
  id: string;
  originalIndex: number;
}

interface DraggableHeaderProps {
  column: Header<Product, unknown>;
  moveColumn: (draggedId: string, overIndex: number) => void;
  findColumn: (id: string) => { id: string; index: number };
}

const CustomDragLayer: React.FC = () => {
    const { isDragging, itemType, item, currentOffset } = useDragLayer((monitor) => ({
      isDragging: monitor.isDragging(),
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
      currentOffset: monitor.getSourceClientOffset(),
    }));
  
    if (!isDragging || itemType !== DND_ITEM_TYPE) {
      return null;
    }
  
    const style = currentOffset
      ? {
          position: 'fixed' as const, // Enforcing valid CSS types
          pointerEvents: 'none' as const, // Fixing the type issue for pointerEvents
          left: currentOffset.x,
          top: currentOffset.y,
          zIndex: 1000,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.2s ease',
        }
      : { display: 'none' };
  
    return (
      <div style={style} className="p-2 bg-gray-300 rounded shadow">
        {item?.id}
      </div>
    );
  };
  

const DraggableHeader: React.FC<DraggableHeaderProps> = React.memo(
  ({ column, moveColumn, findColumn }) => {
    const originalIndex = findColumn(column.id).index;

    const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
      type: DND_ITEM_TYPE,
      item: { id: column.id, originalIndex },
      canDrag: column.id !== 'name', // Prevent dragging if it's the "Name" column
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveColumn(droppedId, originalIndex);
        }
      },
    });

    const [, drop] = useDrop<DragItem, void, unknown>({
      accept: DND_ITEM_TYPE,
      canDrop: () => column.id !== 'name', // Prevent dropping on the "Name" column
      hover: ({ id: draggedId }: DragItem) => {
        if (draggedId !== column.id && column.id !== 'name') {
          const { index: overIndex } = findColumn(column.id);
          moveColumn(draggedId, overIndex);
        }
      },
    });

    return (
      <th
        ref={(node) => drag(drop(node))}
        className="p-2 border-r border-gray-300 transition-all duration-300 ease-in-out"
        style={{ opacity: isDragging ? 0.5 : 1, width: column.column.getSize() }}
      >
        {flexRender(column.column.columnDef.header, column.getContext())}
      </th>
    );
  }
);

const ProductTable: React.FC = () => {
  const initialOrder: ColumnOrderState = ['id', 'name', 'price', 'quality', 'description', 'imageUrl'];
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialOrder);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const columnOrderRef = useRef(columnOrder); // Use ref to avoid re-renders during drag

  // Define table columns
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => info.getValue(),
      footer: (info) => info.column.id,
      enableResizing: true,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
      footer: (info) => info.column.id,
      enableResizing: false,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      footer: (info) => info.column.id,
      enableResizing: true,
    }),
    columnHelper.accessor('quality', {
      header: 'Quality',
      cell: (info) => {
        const qualityValue = info.getValue() as number;
        return (
          <div className="flex items-center">
            <input
              type="range"
              min="1"
              max="5"
              value={qualityValue}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setProducts((prevProducts) =>
                  prevProducts.map((product) =>
                    product.id === info.row.original.id ? { ...product, quality: newValue } : product
                  )
                );
              }}
            />
            <span className="ml-2">{qualityValue}</span>
          </div>
        );
      },
      footer: (info) => info.column.id,
      enableResizing: true,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      footer: (info) => info.column.id,
      enableResizing: true,
    }),
    columnHelper.accessor('imageUrl', {
      header: 'Image',
      cell: (info) => <img src={info.getValue() as string} alt="Product" width={50} />,
      footer: (info) => info.column.id,
      enableResizing: true,
    }),
  ];

  // Use the `useReactTable` hook
  const table = useReactTable({
    data: products,
    columns,
    state: { columnOrder },
    getCoreRowModel: getCoreRowModel(),
    onColumnOrderChange: setColumnOrder,
  });

  const moveColumn = (draggedId: string, overIndex: number) => {
    const dragIndex = columnOrderRef.current.indexOf(draggedId);
    const newOrder = [...columnOrderRef.current];
    newOrder.splice(dragIndex, 1); // Remove dragged column
    newOrder.splice(overIndex, 0, draggedId); // Add column to the new position
    columnOrderRef.current = newOrder;
    setColumnOrder(newOrder); // Update state after drag ends
  };

  const findColumn = (id: string) => {
    const index = columnOrderRef.current.indexOf(id);
    return { id, index };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      <div className=" mx-auto mt-5">
        <div className="overflow-x-auto max-w-full  scrollbar-hide scrollbar-custom">
          <table className="table-auto  border-collapse border border-gray-300 min-w-[986px] max-w-[986px] custom-width w-full mx-auto">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-300">
                  {headerGroup.headers.map((header) => (
                    <DraggableHeader
                      key={header.id}
                      column={header}
                      moveColumn={moveColumn}
                      findColumn={findColumn}
                    />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-300 transition-all duration-300 ease-in-out">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border-r border-gray-300 transition-all duration-300 ease-in-out">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      </div>
    </DndProvider>
  );
};

export default ProductTable;




