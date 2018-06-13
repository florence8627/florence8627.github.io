library(scatterD3)
setwd("D:/Florence/eResearchprojects/r6-2017/ScottFundedProj/dev/R")
source("D:/Florence/eResearchprojects/r6-2017/ScottFundedProj/dev/R/ComputeMap.R")

PathwayECLinkFilename <-"All_EC.csv"
GenomeMatrix <- matrix(nrow=length(list.files('ScottEC-new')), ncol=176)
names<-vector(length=length(list.files('ScottEC-new')))
count = 0
for (filename in list.files('ScottEC-new')){
  count = count + 1
  ECfileName <- paste('ScottEC-new', filename, sep='/')
  MapMatrix<-ComputeMap(ECfileName, PathwayECLinkFilename)
  MapVector<-colSums(MapMatrix)
  startPos<-regexpr('-',filename)+1
  endPos<-regexpr('-EC.csv',filename)-1
  names[count]<-substr(filename,startPos, endPos)
  GenomeMatrix[count,] <-MapVector
}


pca<-prcomp(GenomeMatrix)
scores<-pca$x
rownames(scores)<-names
scatterD3(scores[,1],scores[,2],lab=names, xlab="PCA1", ylab="PCA2")

