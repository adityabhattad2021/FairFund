import Link from 'next/link';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { fundingVaultABI } from '@/blockchain/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import TableWrapper from '@/components/proposal-table/table-wrapper';
import { Button } from '@/components/ui/button';
import CardWrapper from '@/components/vault-details-card-wrapper';
import { BlockchainActionButton } from '@/components/blockchain-action-button';
import { ArrowRight, PlusCircle, Coins, UserPlus } from 'lucide-react';

const ActionButton = ({
    href,
    icon,
    text,
    disabled,
}: {
    href: string;
    icon: React.ReactNode;
    text: string;
    disabled: boolean;
}) => {
    return (
        <Link
            href={href}
            className={cn(
                'block',
                disabled && 'pointer-events-none opacity-50'
            )}
        >
            <Button
                className="w-full h-full flex items-center justify-between"
                disabled={disabled}
            >
                <span className="flex items-center">
                    {icon}
                    {text}
                </span>
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </Link>
    );
};

export default async function VaultDetailsPage({
    params,
}: {
    params: {
        id: string;
    };
}) {
    const id = params.id;
    const vault = await prisma.fundingVault.findUnique({
        where: {
            id: Number(id),
        },
    });
    if (!vault) {
        redirect('/dashboard');
    }
    const isTallyDatePassed = vault.tallyDate.getTime() < Date.now();

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Vault Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardWrapper fundingVault={vault} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        All Proposals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TableWrapper fundingVaultId={Number(id)} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ActionButton
                            href={`/proposal/new?vaultId=${id}`}
                            icon={<PlusCircle className="mr-2 h-4 w-4" />}
                            text="Create Proposal"
                            disabled={isTallyDatePassed}
                        />
                        <ActionButton
                            href={`/vault/deposit?vaultId=${id}`}
                            icon={<Coins className="mr-2 h-4 w-4" />}
                            text="Deposit Funding Tokens"
                            disabled={isTallyDatePassed}
                        />
                        <ActionButton
                            href={`/vault/register?vaultId=${id}`}
                            icon={<UserPlus className="mr-2 h-4 w-4" />}
                            text="Register to Vote"
                            disabled={isTallyDatePassed}
                        />
                        <BlockchainActionButton
                            smartContractAddress={
                                vault.vaultAddress as `0x${string}`
                            }
                            functionName="distributeFunds"
                            smartContractABI={fundingVaultABI}
                            buttonText="Distrubute Funds"
                            iconName="distrubuteFunds"
                            isDisabled={!isTallyDatePassed}
                            successMessage="Funds distributed successfully."
                            className="w-full h-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                        />
                        <BlockchainActionButton
                            smartContractAddress={
                                vault.vaultAddress as `0x${string}`
                            }
                            functionName="releaseVotingTokens"
                            smartContractABI={fundingVaultABI}
                            buttonText="Withdraw Voting Tokens"
                            iconName="creditCard"
                            isDisabled={!isTallyDatePassed}
                            successMessage="Voting tokens withdrawn successfully."
                            className="w-full h-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
