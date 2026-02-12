import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function IngredientUsageForm({ Bid, onSubmit }) {
    const [ingredients, setIngredients] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);

    useEffect(() => {
        api.get(`/TFF/chef/branch-ingredients/?branchCode=${Bid}`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setAvailableItems(res.data);
                } else if (Array.isArray(res.data.data)) {
                    setAvailableItems(res.data.data);
                } else {
                    setAvailableItems([]);
                    console.error("Unexpected ingredient response:", res.data);
                }
            })
            .catch(err => {
                console.error("Ingredient load error", err);
                setAvailableItems([]);
            });
    }, []);


    const addRow = () => {
        setIngredients([...ingredients, { item_id: "", quantity: "" }]);
    };

    const updateRow = (index, field, value) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    const submit = () => {
        onSubmit(ingredients);
    };

    return (
        <>  
            <h6>Ingredients Used</h6>
            <p>{Bid}</p>

            {ingredients.map((row, i) => (
                <div className="row mb-2" key={i}>
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={row.item_id}
                            onChange={(e) =>
                                updateRow(i, "item_id", e.target.value)
                            }
                        >
                            <option value="">Select Ingredient</option>
                            {availableItems.map(item => (
                                <option key={item.item_id} value={item.item_id}>
                                    {item.name} (Available: {item.available_qty} {item.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="Quantity used"
                            value={row.quantity}
                            onChange={(e) =>
                                updateRow(i, "quantity", e.target.value)
                            }
                        />
                    </div>
                </div>
            ))}

            <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={addRow}
            >
                + Add Ingredient
            </button>

            <button
                className="btn btn-success float-end"
                onClick={submit}
            >
                Mark as Prepared
            </button>
        </>
    );
}
