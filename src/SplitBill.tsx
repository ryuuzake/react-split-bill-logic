import { useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import create from "zustand";

const usePriceStore = create<
  {
    initialBill: number;
    currentBill: number;
    evenSplitBill: number;
    setInitialPrice: (price: number) => void;
    setManualBill: (index: number, bill: number) => void;
    removeManualBill: (index: number) => void;
    addChildBill: () => void;
    deleteChildBill: (index: number) => void;
  } & BillState
>((set) => ({
  initialBill: 0,
  currentBill: 0,
  evenSplitBill: 0,
  splitBill: [],
  setInitialPrice: (price) =>
    set(() => ({ initialBill: price, currentBill: price })),
  setManualBill: (index: number, bill: number) =>
    set((state) => {
      const currentBill = state.currentBill - bill;

      const splitBill = state.splitBill.at(index);
      if (typeof splitBill !== "undefined") {
        splitBill.manualEdit = true;
        splitBill.bill = bill;
      }

      const splitBillMembers = state.splitBill.filter((s) => !s.manualEdit);
      const totalEvenSplitBill = splitBillMembers.length;
      const evenSplitBill = currentBill / totalEvenSplitBill;
      splitBillMembers.forEach((s) => (s.bill = evenSplitBill));

      console.log(state.splitBill);

      return {
        splitBill: [...state.splitBill],
        currentBill: currentBill,
        evenSplitBill: evenSplitBill,
      };
    }),
  removeManualBill: (index) =>
    set((state) => {
      const splitBill = state.splitBill.at(index);
      if (typeof splitBill === "undefined") {
        return {};
      }

      splitBill.manualEdit = false;
      const currentBill = state.currentBill + splitBill.bill;

      const splitBillMembers = state.splitBill.filter((s) => !s.manualEdit);
      const totalEvenSplitBill = splitBillMembers.length;
      const evenSplitBill = currentBill / totalEvenSplitBill;
      splitBillMembers.forEach((s) => (s.bill = evenSplitBill));

      return {
        splitBill: [...state.splitBill],
        currentBill: currentBill,
        evenSplitBill: evenSplitBill,
      };
    }),
  addChildBill: () =>
    set((state) => {
      state.splitBill.push({ name: "", email: "", bill: 0, manualEdit: false });
      const splitBillMembers = state.splitBill.filter((s) => !s.manualEdit);
      const totalEvenSplitBill = splitBillMembers.length;
      const evenSplitBill = state.currentBill / totalEvenSplitBill;

      return { splitBill: [...state.splitBill], evenSplitBill: evenSplitBill };
    }),
  deleteChildBill: (index) =>
    set((state) => {
      state.splitBill.splice(index, 1);
      const splitBillMembers = state.splitBill.filter((s) => !s.manualEdit);
      const totalEvenSplitBill = splitBillMembers.length;
      const evenSplitBill = state.currentBill / totalEvenSplitBill;

      return { splitBill: [...state.splitBill], evenSplitBill: evenSplitBill };
    }),
}));

type BillState = {
  splitBill: {
    name: string;
    email: string;
    bill: number;
    manualEdit: boolean;
  }[];
};

const Total = ({ control }: { control: Control<BillState> }) => {
  const initialBill = usePriceStore((state) => state.initialBill);
  const currentBill = usePriceStore((state) => state.currentBill);
  const evenSplitBill = usePriceStore((state) => state.evenSplitBill);
  const formValues = useWatch({
    name: "splitBill",
    control,
  });
  const total = formValues.reduce(
    (acc, current) => acc + (current.bill || 0),
    0
  );

  return (
    <>
      <p>Initial Bill: {initialBill}</p>
      <p>Current Bill: {currentBill}</p>
      <p>Even Split Bill: {evenSplitBill}</p>
      <p>Total Amount: {total}</p>
    </>
  );
};

export default function App() {
  const setInitialPrice = usePriceStore((state) => state.setInitialPrice);
  const setManualBill = usePriceStore((state) => state.setManualBill);
  const addChildBill = usePriceStore((state) => state.addChildBill);
  const deleteChildBill = usePriceStore((state) => state.deleteChildBill);
  const removeManualBill = usePriceStore((state) => state.removeManualBill);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BillState>({
    defaultValues: {
      splitBill: [],
    },
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    name: "splitBill",
    control,
  });
  const onSubmit = (data: BillState) => console.log(data);

  useEffect(() => {
    setInitialPrice(25.99);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <section className={"section"} key={field.id}>
                <input
                  placeholder="name"
                  {...register(`splitBill.${index}.name` as const, {
                    required: true,
                  })}
                  className={errors?.splitBill?.[index]?.name ? "error" : ""}
                />
                <input
                  placeholder="email"
                  type="email"
                  {...register(`splitBill.${index}.email` as const, {
                    required: true,
                  })}
                  className={errors?.splitBill?.[index]?.email ? "error" : ""}
                />
                <input
                  placeholder="bill"
                  type="number"
                  {...register(`splitBill.${index}.bill` as const, {
                    valueAsNumber: true,
                    required: true,
                  })}
                  className={errors?.splitBill?.[index]?.bill ? "error" : ""}
                />
                <input
                  type="checkbox"
                  {...register(`splitBill.${index}.manualEdit` as const, {
                    required: true,
                  })}
                  className={
                    errors?.splitBill?.[index]?.manualEdit ? "error" : ""
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    remove(index);
                    deleteChildBill(index);
                  }}
                >
                  DELETE
                </button>
              </section>
            </div>
          );
        })}

        <Total control={control} />

        <button
          type="button"
          onClick={() => {
            append({ name: "", email: "", bill: 0, manualEdit: false });
            addChildBill();
          }}
        >
          APPEND
        </button>
        <input type="submit" />
      </form>
    </div>
  );
}
