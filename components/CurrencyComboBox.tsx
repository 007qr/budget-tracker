"use client"

import * as React from "react"

import { useMediaQuery } from "~/hooks/use-media-query"
import { Button } from "~/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "~/components/ui/drawer"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { Currencies, Currency } from "~/lib/currencies"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeleteonWrapper from "./SkeleteonWrapper"
import { UserSettings } from "@prisma/client"
import { UpdateUserCurrency } from "~/app/wizard/_actions/user-settings"
import { toast } from "sonner"
import { DialogTitle } from "@radix-ui/react-dialog"


export function CurrencyComboBox() {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
        null
    );

    const userSettings = useQuery<UserSettings>({
        queryKey: ['userSettings'],
        queryFn: () => fetch('/api/user-settings').then(res => res.json())
    });

    React.useEffect(() => {
        if (!userSettings.data) return;

        const userCurrency = Currencies.find((currency) => currency.value === userSettings.data.currency);
        if (userCurrency) setSelectedOption(userCurrency || null);

    }, [
        userSettings.data,
    ]);

    const mutation = useMutation({
        mutationFn: UpdateUserCurrency,
        onSuccess: (data: UserSettings) => {
            toast.success(`Currency updated successfully 🎊`, {id:"update-currency"});
            setSelectedOption(Currencies.find(c=>c.value == data.currency) || null);
        },

        onError: (_) => {
            toast.error("Something went wrong", {id: "update-currency"})
        }
    });

    const selectOption = React.useCallback(
        (currency: Currency | null) => {
        if (!currency) {
            toast.error("Please select a currency");
            return;
        }

        toast.loading("Updating currency...", {
            id: "update-currency"
        });

        mutation.mutate(currency.value);
    }, [mutation]);

    if (isDesktop) {
        return (
            <SkeleteonWrapper isLoading={userSettings.isFetching}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button disabled={mutation.isPending} variant="outline" className="w-full justify-start">
                            {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                        <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
                    </PopoverContent>
                </Popover>
            </SkeleteonWrapper>
        )
    }

    return (
        <SkeleteonWrapper isLoading={userSettings.isFetching}>
        <Drawer open={open} onOpenChange={setOpen}>
            <DialogTitle className="hidden"></DialogTitle>
            <DrawerTrigger asChild>
                <Button disabled={mutation.isPending} variant="outline" className="w-full justify-start">
                    {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
                </div>
            </DrawerContent>
        </Drawer>
        </SkeleteonWrapper>
    )
}

function OptionList({
    setOpen,
    setSelectedOption,
}: {
    setOpen: (open: boolean) => void
    setSelectedOption: (status: Currency | null) => void
}) {
    return (
        <Command>
            <CommandInput placeholder="Filter currency..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {Currencies.map((currency) => (
                        <CommandItem
                            key={currency.value}
                            value={currency.value}
                            onSelect={(value) => {
                                setSelectedOption(
                                    Currencies.find((currency) => currency.value === value) || null
                                )
                                setOpen(false)
                            }}
                        >
                            {currency.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
