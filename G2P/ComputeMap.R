
ComputeMap <- function(ECfilename, PathwayECLinkFilename="All_EC.csv") {
  
  library(reshape2)
  library(ggplot2)
  
  
  Genome <- read.csv(file=ECfileName, header=TRUE, sep=",")
  ALL <- read.csv(file=PathwayECLinkFilename, header=TRUE, sep=",")
  
  # Keeping only one record for "path:ec00130" and "path:map00130"
  AllEC <- ALL[grep("^(path:map)", ALL$Pathways),]
  
  unique_pathway <- unique(AllEC$Pathways)
  # changing the format of the string that contains EC number in the genome/EC files
  # to lowercase
  Genome$EC.Numbers <- sapply(Genome$EC.Numbers, tolower)
  
  # replace "ec " with "ec:"
  Genome$EC.Numbers <-gsub("ec", "ec:", Genome$EC.Numbers)
  
  AllEC$ECs <-gsub("ec:", "ec: ", AllEC$ECs)
  
  PathwayMatrix <- matrix(data=0, nrow=length(Genome$EC.Numbers), ncol=length(unique_pathway))
  
  # filling the occurence matrix for pathways
  for(i in 1:length(Genome$EC.Numbers)){
    #print(i)
    ind <-grep(Genome$EC.Numbers[i], AllEC$ECs)
    if(length(ind)!=0){
      map <-AllEC[ind,2]
      for(k in 1:length(map)){
        map_ind <- grep(map[k],unique_pathway)
        PathwayMatrix[i,map_ind] <- 1 #Genome$Occurrence[i] 
      }
    }
  }
  
  colnames(PathwayMatrix)<-unique_pathway
  rownames(PathwayMatrix)<-Genome$EC.Numbers
  plotdata<-melt(PathwayMatrix)
  ggplot(plotdata, aes(x = Var2, y = Var1)) + 
    geom_raster(aes(fill=value)) + 
    scale_fill_gradient(low="grey90", high="red") +
    labs(x="pathways", y="EC numbers", title=ECfileName) +
    theme_bw() + theme(axis.text.x=element_text(size=2, angle=90, vjust=0.3),
                       axis.text.y=element_text(size=1),
                       plot.title=element_text(size=11))
  ggsave(paste0(ECfileName,".pdf"), width=10, height=10)
  
  return(PathwayMatrix)
  
  }