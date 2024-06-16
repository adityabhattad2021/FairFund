'use client';
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseUnits } from "viem";
import { writeContract, simulateContract } from '@wagmi/core'
import { config as wagmiConfig } from "@/wagmi/config";
import { erc20ABI } from "@/constants";
import axios from "axios";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface DepositTokensFormProps {
    fundingTokenAddress: string;
    vaultAddress: string;
    vaultId: number;
}

const depositTokensForm = z.object({
    amountOfTokens: z.string({
        required_error: "Amount of tokens is required",
    }),
})


export default function DepositTokensForm({
    fundingTokenAddress,
    vaultAddress,
    vaultId
}: DepositTokensFormProps) {

    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { toast } = useToast()

    const form = useForm<z.infer<typeof depositTokensForm>>({
        resolver: zodResolver(depositTokensForm),
        defaultValues: {
            amountOfTokens: ""
        }
    })

    async function handleSubmit(data: z.infer<typeof depositTokensForm>) {
        if (!isConnected || !address) {
            return;
        }
        try {
            const amountOfTokens = parseUnits(data.amountOfTokens, 6);
            const hash = await writeContract(wagmiConfig, {
                // @ts-ignore
                address: fundingTokenAddress,
                abi: erc20ABI,
                functionName: 'transfer',
                args: [
                    vaultAddress,
                    amountOfTokens
                ]
            })
            await axios.post('/api/vault/deposit', {
                vaultId: vaultId,
                amountOfTokens: data.amountOfTokens
            })
            router.push(`/vault/${vaultId}`);
            router.refresh();
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error depositing the token',
                description: 'Something went wrong. Please try again.'
            })
            console.log('[DEPOSIT_TOKENS_FORM]: ', err);
        }


    }

    return (
        <Card className="m-6">
            <CardHeader>
                <CardTitle>
                    Deposit Tokens
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField
                            name="amountOfTokens"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>
                                            Amount of Tokens
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="in ETH."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This will trigger a blockchain transaction.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <div className="w-full flex justify-center">
                            <Button size={"lg"}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}