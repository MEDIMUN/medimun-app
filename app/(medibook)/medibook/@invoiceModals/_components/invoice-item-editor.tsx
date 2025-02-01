import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InvoiceItem {
	description: string;
	price: number;
	quantity: number;
	descriptionLocked?: boolean;
	priceLocked?: boolean;
	quantityLocked?: boolean;
}

interface InvoiceItemsEditorProps {
	initialItems: InvoiceItem[];
	onChange: (items: InvoiceItem[]) => void;
}

export function InvoiceItemsEditor({ initialItems, onChange }: InvoiceItemsEditorProps) {
	const [items, setItems] = useState<InvoiceItem[]>(initialItems);

	const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };
		setItems(newItems);
		onChange(newItems);
	};

	const addItem = () => {
		setItems([...items, { description: "", price: 0, quantity: 0 }]);
		onChange([...items, { description: "", price: 0, quantity: 0 }]);
	};

	const removeItem = (index: number) => {
		const newItems = items.filter((_, i) => i !== index);
		setItems(newItems);
		onChange(newItems);
	};

	const resetItems = () => {
		setItems(initialItems);
		onChange(initialItems);
	};

	return (
		<div className="space-y-2">
			<div className="flex px-1 text-sm items-center space-x-2">
				<p className="w-64">Description</p>
				<p className="w-16">Price</p>
				<p>Quantity</p>
			</div>
			{items.map((item, index) => (
				<div key={index} className="flex items-center space-x-2">
					<Input
						className="w-64"
						value={item.description}
						onChange={(e) => handleItemChange(index, "description", e.target.value)}
						placeholder="Description"
						disabled={item.descriptionLocked}
					/>
					<Input
						className="w-16"
						type="number"
						value={item.price}
						onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value))}
						placeholder="Price"
						disabled={item.priceLocked}
					/>
					<Input
						className="w-16"
						type="number"
						value={item.quantity}
						onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value, 10))}
						placeholder="Quantity"
						disabled={item.quantityLocked}
					/>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="aspect-square"
						disabled={item.descriptionLocked || item.priceLocked || item.quantityLocked}
						onClick={() => removeItem(index)}>
						<Minus className="h-4 w-4" />
					</Button>
				</div>
			))}
			<div className="flex justify-end mt-2">
				<Button type="button" variant="outline" onClick={resetItems} className="mr-2">
					Reset
				</Button>
				<Button type="button" className="w-9 mr-1" onClick={addItem}>
					<Plus className="" />
				</Button>
			</div>
		</div>
	);
}
